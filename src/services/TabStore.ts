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

console.log(makeid(5));

export type HydratedWindow = WWindow & {
  tabs: ActiveVisit[];
  chromeId: number;
};

export class TabStore {
  imageStore: ImageStore;

  constructor(x: ImageStore) {
    this.imageStore = x;

    chrome.windows.onRemoved.addListener(this.removeWindow);
    chrome.windows.onCreated.addListener(this.addWindow);
    chrome.tabs.onCreated.addListener(this.addTab);
    chrome.tabs.onRemoved.addListener(this.removeTab);
    chrome.tabs.onMoved.addListener(this.moveTab);
    chrome.tabs.onUpdated.addListener(this.updateTab);
    chrome.tabs.onAttached.addListener(this.attachTab);
    chrome.tabs.onActivated.addListener(this.activateTab);
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

  addTab = (tab: chrome.tabs.Tab) => {
    console.log("addTab");
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
        id: hashCode(tab.url || ""),

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
      //@ts-ignore
      status: tab.status,
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
        crawl: storedTab.crawl,
        openedAt: new Date(),
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

      db.pages.update(hashCode(storedTab.url), { activeAt: new Date() });
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

    // console.log("TABS BEFORE SPLICE", newStoredWindow.tabs);
    newStoredWindow.tabs.splice(attachInfo.newPosition, 0, storedTab);
    // console.log("TABS AFTER SPLICE", newStoredWindow.tabs);

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

      type: "anonymous",

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
    console.log("getInitialData");
    var windows = await chrome.windows.getAll({ populate: true });
    windows.forEach((w) => {
      this.addWindow(w);
      w.tabs!.forEach((t) => {
        this.addTab(t);
      });
    });
  }

  activateTab = async (activeInfo: chrome.tabs.TabActiveInfo) => {
    setTimeout(async () => {
      console.log("activateTab");
      var im = await captureVisibleTab({ windowId: activeInfo.windowId });

      const key = makeid(10);
      this.imageStore.store(key, im);

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

      console.log("Stored image", key, im);

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
