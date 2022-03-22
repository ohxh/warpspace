import { hashCode } from "../utils/HashCode";
import { WarpspaceEvent } from "../utils/WarpspaceEvent";
import { captureVisibleTab } from "./CaptureVisibleTab";
import {
  ActiveVisit,
  AnonymousWindow,
  ChromeTabPosition,
  ChromeTabState,
  ClosedVisit,
  db,
  Page,
  PageCrawl,
  PageMetadata,
  SuspendedVisit,
  Visit,
  WWindow,
} from "./Database";
import { ImageStore } from "./ImageStore";
import { info } from "./Logging";
import { SearchService } from "./search/Search";

function makeid(length: number) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export type HydratedWindow = WWindow & {
  tabs: ActiveVisit[];
  chromeId: number;
};

export class TabStore {
  imageStore: ImageStore;
  searchIndex: SearchService;

  constructor(x: ImageStore) {
    this.imageStore = x;

    chrome.windows.onRemoved.addListener(this.removeWindow);
    chrome.windows.onCreated.addListener(this.addWindow);
    chrome.windows.onFocusChanged.addListener(this.windowFocusChanged);
    chrome.tabs.onCreated.addListener(this.addTab);
    chrome.tabs.onRemoved.addListener(this.removeTab);
    chrome.tabs.onMoved.addListener(this.moveTab);
    chrome.tabs.onUpdated.addListener(this.updateTab);
    chrome.tabs.onAttached.addListener(this.attachTab);
    chrome.tabs.onActivated.addListener(this.activateTab);
    chrome.runtime.onMessage.addListener((m, sender, sendResponse) => {
      if (m.event === "request-capture") {
        console.warn("capture requested");
        this.captureTab();
      }
      if (m.event === "new-tab-open") {
        this.newTabOpen(sender.tab!.id!);
      }
      if (m.event === "content-scraped") {
        this.indexTextContent(sender.tab!.id!, m.data);
      }
      if (m.event === "request-search") {
        this.searchIndex.processSearch(m.data).then(sendResponse);
        return true;
      }
      if (m.event === "register-warpspace-open") {
        this.previewCaptureLastInvalidatedAt = Date.now();
        db.visits
          .where("chromeId")
          .equals(sender.tab!.id!)
          .toArray()
          .then((t) => {
            console.warn("register");
            if (t[0]) db.visits.update(t[0].id, { warpspaceOpen: true });
            console.info(
              "INFO: ",
              "warpspace open",
              (t[0] as ActiveVisit).metadata.title
            );
          })
          .catch((e) => console.error(e));
      }
      if (m.event === "register-warpspace-closed") {
        this.previewCaptureLastInvalidatedAt = Date.now();
        db.visits
          .where("chromeId")
          .equals(sender.tab!.id!)
          .toArray()
          .then((t) => {
            if (t[0])
              db.visits.update(t[0].id, {
                warpspaceOpen: false,
                warpspaceLastOpen: new Date(),
              });
            console.info(
              "INFO: ",
              "warpspace closed",
              (t[0] as ActiveVisit).metadata.title
            );
          })
          .catch((e) => console.error(e));
      }
    });

    this.searchIndex = new SearchService(this);
  }

  stateChanged: WarpspaceEvent<[]> = new WarpspaceEvent();

  // Todo count in db on startup
  totalWindows: number = 0;
  totalVisits: number = 0;

  //Chrome events only give us a chrome id to work with.
  //These records map those ids to our tab objects.
  windows: Record<number, HydratedWindow> = {};
  tabs: Record<number, ActiveVisit> = {};
  state: HydratedWindow[] = [];

  previewCaptureLastInvalidatedAt = Date.now();

  processSearch = async (query: string, sendResponse: (x: any) => void) => {
    sendResponse(await this.searchIndex.processSearch(query));
  };

  indexTextContent = async (chromeId: number, content: string) => {
    const tab = this.tabs[chromeId];
    const searchId = await this.searchIndex.indexDocument({
      title: tab.metadata.title,
      url: tab.metadata.url,
      body: content,
    });

    console.log(
      "verify pages",
      await db.pages.toArray(),
      hashCode(tab.url || "")
    );

    const oldPage = await db.pages.get(tab.url || "");
    const oldVisit = await db.visits.get(tab.id);

    console.log("!", await db.visits.update(tab.id, { searchId: searchId }));
    await db.pages.update(tab.url || "", { searchId });

    const newVisit = await db.visits.get(tab.id);

    console.log({ oldPage, oldVisit, newVisit });

    if (oldPage?.searchId !== undefined)
      this.searchIndex.removeDocument(oldPage.searchId);
    //@ts-ignore
    if (oldVisit?.searchId !== undefined)
      //@ts-ignore
      this.searchIndex.removeDocument(oldVisit.searchId);
  };

  /** Register that a new tab is in fact the new tab page
   * Since it's indistinguishable from chrome system pages to us
   */
  newTabOpen = (chromeId: number) => {
    const tab = this.tabs[chromeId];
    tab.isNewTabPage = true;
    db.visits.update(tab.id, {
      isNewTabPage: true,
    });
  };

  addTab = async (tab: chrome.tabs.Tab) => {
    console.log("addTab", tab);
    if (
      tab.id === undefined ||
      tab.id === null ||
      tab.id === chrome.tabs.TAB_ID_NONE
    )
      throw new Error("No id on tab");
    if (
      tab.windowId === undefined ||
      tab.windowId === null ||
      tab.windowId === chrome.windows.WINDOW_ID_NONE
    )
      throw new Error("No window id on tab");

    const storedWindow = this.windows[tab.windowId];

    const metadata: PageMetadata = {
      url: tab.url!,
      title: tab.title,
      favIconUrl: tab.favIconUrl,
    };

    const crawl: PageCrawl = {
      lod: 1,
    };

    const position: ChromeTabPosition = {
      index: tab.index,
      groupId: tab.groupId,
      muted: tab.mutedInfo?.muted || false,
      pinned: tab.pinned,
    };

    const state: ChromeTabState = {
      //@ts-ignore
      status: tab.status,
      audible: tab.audible || false,
      active: tab.active,
    };

    var newTab: ActiveVisit = {
      id: this.totalVisits++,
      chromeId: tab.id,
      url: tab.url!,

      status: "active",
      windowId: storedWindow.id,
      chromeWindowId: tab.windowId,

      metadata,
      crawl,
      position,
      state,

      openedAt: new Date(),
      warpspaceOpen: false,
    };

    //Add the tab to the window's object in the correct position
    storedWindow.tabs.splice(tab.index, 0, newTab);
    //Add the new tab to our lookup table
    this.tabs[tab.id] = newTab;

    this.stateChanged.fire();

    // Push db changes to both window and tab
    db.visits.add(newTab);

    if (tab.url) {
      var newPage: Page = {
        status: "full",
        url: tab.url!,
        crawl,
        metadata,

        activeAt: new Date(),
      };
      db.pages.add(newPage);
    }
  };

  updateTab = (
    id: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) => {
    console.log("updateTab");
    const storedTab = this.tabs[id];
    const storedWindow = this.windows[tab.windowId];

    const metadata: PageMetadata = {
      url: tab.url!,
      title: tab.title,
      favIconUrl: tab.favIconUrl,
    };

    const position: ChromeTabPosition = {
      index: tab.index,
      groupId: tab.groupId,
      muted: tab.mutedInfo?.muted || false,
      pinned: tab.pinned,
    };

    const state: ChromeTabState = {
      active: tab.active,
      status: tab.status as "complete",
      audible: tab.audible || false,
    };

    if (changeInfo.hasOwnProperty("url")) {
      if (storedTab.url === undefined) {
        // Closing a tab with no url, we can forget the visit
        info("Detected navigation from blank tab, deleting old visit");
        db.visits.delete(storedTab.id);
      } else {
        info("Detected navigation, closing old visit");
        var closingVisit: ClosedVisit = {
          id: storedTab.id,
          status: "closed",
          windowId: storedTab.windowId,
          url: storedTab.url,
          position: storedTab.position,
          openedAt: storedTab.openedAt,
          // Last active now, i.e. when closed
          activeAt: new Date(),
        };
        // Overwrited old active visit
        db.visits.put(closingVisit);
      }
      var openingVisit: ActiveVisit = {
        id: this.totalVisits++,
        chromeId: id,
        status: "active",
        windowId: storedTab.windowId,
        url: storedTab.url,
        position,
        state,
        metadata,
        chromeWindowId: tab.windowId,
        crawl: {
          lod: 3,
        },
        openedAt: new Date(),
        warpspaceOpen: false,
      };

      // Splice this into our in-memory data structures
      this.tabs[id] = openingVisit;
      storedWindow.tabs.splice(tab.index, 1, openingVisit);

      // Adds new visit
      db.visits.put(openingVisit);
    } else {
      // Url didn't change, so this must be a plain update
      var newTab: ActiveVisit = {
        ...storedTab,
        url: tab.url!,
        metadata,
        position,
        state,
      };

      // Replace the tab in the window & tab lookup tables
      storedWindow.tabs.splice(tab.index, 1, newTab);
      this.tabs[tab.id!] = newTab;

      this.stateChanged.fire();

      // Push db changes to both window and tab
      db.visits.update(newTab.id, { metadata, position, state });
    }
  };

  moveTab = (id: number, moveInfo: chrome.tabs.TabMoveInfo) => {
    console.log("moveTab");
    const storedTab = this.tabs[id];
    const storedWindow = this.windows[storedTab.chromeWindowId];

    if (moveInfo.windowId !== storedTab.chromeWindowId)
      throw new Error(
        "bad windowid: " + moveInfo.windowId + " vs " + storedTab.windowId
      );

    //Move the tab in our local state
    storedWindow.tabs.splice(moveInfo.fromIndex, 1);
    storedWindow.tabs.splice(moveInfo.toIndex, 0, storedTab);

    this.stateChanged.fire();

    db.transaction("rw", db.visits, (t) => {
      storedWindow.tabs.forEach((t, i) => {
        t.position.index = i;
        db.visits.update(t.id, { position: t.position });
      });
    });
  };

  updatePreview = (id: number, previewImage: string) => {
    console.log("updatePreview");
    // var storedTab = this.tabLookup[id];
    // storedTab.previewImage = previewImage;
    // db.tabs.update(storedTab.UUID, { previewImage });
    // this.onStateChanged.fire({});
  };

  removeTab = async (id: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
    console.log("removeTab");
    var storedTab = this.tabs[id];
    var storedWindow = this.windows[storedTab.chromeWindowId];

    storedWindow.tabs.splice(storedTab.position.index, 1);
    delete this.tabs[id];

    this.stateChanged.fire();

    if (storedTab.url) {
      if (removeInfo.isWindowClosing) {
        const suspendingTab: SuspendedVisit = {
          id: storedTab.id,
          windowId: storedTab.windowId,
          url: storedTab.url,
          openedAt: storedTab.openedAt,
          position: storedTab.position,

          status: "suspended",
          metadata: storedTab.metadata,
          crawl: storedTab.crawl,
          state: storedTab.state,
          activeAt: new Date(),
        };

        db.visits.put(suspendingTab);
      } else {
        const closingTab: ClosedVisit = {
          id: storedTab.id,
          windowId: storedTab.windowId,
          url: storedTab.url,
          openedAt: storedTab.openedAt,
          position: storedTab.position,

          status: "closed",
          activeAt: new Date(),
        };

        db.visits.put(closingTab);
      }

      db.pages.update(storedTab.url, { activeAt: new Date() });
    } else {
      db.visits.delete(storedTab.id);
    }
  };

  attachTab = (id: number, attachInfo: chrome.tabs.TabAttachInfo) => {
    console.log("attachTab");
    // We don't do anything on detach, so we need to complete the entire
    // move between windows here
    const storedTab = this.tabs[id];
    const oldStoredWindow = this.windows[storedTab.chromeWindowId];
    const newStoredWindow = this.windows[attachInfo.newWindowId];

    storedTab.windowId = newStoredWindow.id;
    storedTab.chromeWindowId = attachInfo.newWindowId;

    oldStoredWindow.tabs.splice(storedTab.position.index, 1);

    oldStoredWindow.tabs.forEach((t, i) => {
      t.position.index = i;
      db.visits.update(t.id, { position: t.position });
    });

    newStoredWindow.tabs.splice(attachInfo.newPosition, 0, storedTab);

    newStoredWindow.tabs.forEach((t, i) => {
      t.position.index = i;
      db.visits.update(t.id, { position: t.position });
    });

    db.visits.update(storedTab.id, {
      windowId: storedTab.windowId,
      chromeWindowId: storedTab.chromeWindowId,
    });

    this.stateChanged.fire();
  };

  addWindow = (window: chrome.windows.Window) => {
    console.log("addWindow");
    const storedWindow: AnonymousWindow = {
      id: this.totalWindows++,
      chromeId: window.id!,

      type: "anonymous",

      focused: window.focused,

      status: "open",

      height: window.height!,
      width: window.width!,
      top: window.top!,
      left: window.left!,

      createdAt: new Date(),
      activeAt: new Date(),
    };

    this.windows[window.id!] = {
      ...storedWindow,
      tabs: [],
      chromeId: window.id!,
    };

    this.state.push(this.windows[window.id!]);

    this.stateChanged.fire();

    db.windows.add(storedWindow);
  };

  windowFocusChanged = (chromeId: number) => {
    console.log("windowFocusChanged");

    Object.values(this.windows).forEach((v) => {
      v.focused = false;
    });

    if (chromeId !== chrome.windows.WINDOW_ID_NONE)
      this.windows[chromeId].focused = true;

    Object.values(this.windows).forEach((v) => {
      db.windows.update(v.id, { focused: v.focused });
    });

    this.stateChanged.fire();
  };

  /*updateWindow(id: number, changes: any) {
    //Object.assign(this.windows[id].tabs[tab.id], changeInfo);
    this.onStateChanged.fire({});
  }*/

  removeWindow = (id: number) => {
    console.log("removeWindow");
    const storedWindow = this.windows[id];

    this.state = this.state.filter((n) => n.chromeId !== id);
    delete this.windows[id];

    this.stateChanged.fire();

    db.windows.delete(storedWindow.id);
  };

  async getInitialData() {
    console.warn("GetInitialData");
    var windows = await chrome.windows.getAll({ populate: true });
    windows.forEach((w) => {
      this.addWindow(w);
      w.tabs!.forEach((t) => {
        this.addTab(t);
      });
    });
  }

  captureTab = async () => {
    var t0 = performance.now();

    const tab = (
      await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      })
    )[0];

    console.log("Query tab: ", performance.now() - t0);
    t0 = performance.now();

    const startTime = Date.now();

    var im = await captureVisibleTab(
      { windowId: tab.windowId },
      async (partial) => {
        console.log("Partial done: ", performance.now() - t0);

        // if (this.previewCaptureLastInvalidatedAt - startTime > -100) return;

        const key = makeid(10);
        this.imageStore.store(key, im);

        const cur = this.tabs[tab.id!];

        if (((await db.visits.get(cur.id)) as ActiveVisit).warpspaceOpen)
          return;

        cur.state.active = true;

        cur.crawl = {
          ...cur.crawl,
          lod: 1,
          previewImage: key,
        };

        db.visits.update(cur.id, {
          crawl: cur.crawl,
          state: cur.state,
        });
      }
    );

    console.error(
      this.previewCaptureLastInvalidatedAt,
      this.previewCaptureLastInvalidatedAt > startTime ? " > " : " <= ",
      startTime,
      this.previewCaptureLastInvalidatedAt - startTime
    );
    // if (this.previewCaptureLastInvalidatedAt - startTime > -100) return;

    console.log("Capturevisibletab: ", performance.now() - t0);
    t0 = performance.now();

    const key = makeid(10);
    await this.imageStore.store(key, im);

    console.log("store: ", performance.now() - t0);
    t0 = performance.now();

    const cur = this.tabs[tab.id!];

    if (((await db.visits.get(cur.id)) as ActiveVisit).warpspaceOpen) return;

    cur.state.active = true;

    cur.crawl = {
      ...cur.crawl,
      lod: 1,
      previewImage: key,
    };

    db.visits.update(cur.id, {
      crawl: cur.crawl,
      state: cur.state,
    });

    console.log("write to dexie: ", performance.now() - t0);
    t0 = performance.now();
  };

  activateTab = async (activeInfo: chrome.tabs.TabActiveInfo) => {
    this.previewCaptureLastInvalidatedAt = Date.now();
    const workStartedAt = Date.now();
    setTimeout(async () => {
      var t0 = performance.now();
      var im = await captureVisibleTab(
        { windowId: activeInfo.windowId },
        () => {}
      );

      const key = makeid(10);
      await this.imageStore.store(key, im);

      const prev = this.windows[activeInfo.windowId].tabs.find(
        (n) => n.state.active === true
      );
      const cur = this.tabs[activeInfo.tabId];

      cur.state.active = true;

      cur.crawl = {
        ...cur.crawl,
        lod: 1,
        previewImage: key,
      };

      db.visits.update(cur.id, {
        crawl: cur.crawl,
        state: cur.state,
      });
      if (prev) {
        prev.state.active = false;
        db.visits.update(prev.id, {
          state: prev.state,
        });
      }
    }, 100);
  };
}
