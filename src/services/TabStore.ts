import { Transaction } from "dexie";
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
  tabs: (ActiveVisit & { id: number })[];
  id: number;
  chromeId: number;
};

const imageStore = new ImageStore();
const searchIndex = new SearchService();

// previewCaptureLastInvalidatedAt = Date.now();

const processSearch = async (query: string, sendResponse: (x: any) => void) => {
  sendResponse(await searchIndex.processSearch(query));
};

const indexTextContent = async (chromeId: number, content: string) => {
  const tab = await tabFromChromeId(chromeId);
  const searchId = await searchIndex.indexDocument({
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
  const oldVisit = await db.visits.get(tab.id!);

  console.log("!", await db.visits.update(tab.id!, { searchId: searchId }));
  await db.pages.update(tab.url || "", { searchId });

  const newVisit = await db.visits.get(tab.id!);

  console.log({ oldPage, oldVisit, newVisit });

  if (oldPage?.searchId !== undefined)
    searchIndex.removeDocument(oldPage.searchId);
  //@ts-ignore
  if (oldVisit?.searchId !== undefined)
    //@ts-ignore
    searchIndex.removeDocument(oldVisit.searchId);
};

const tabFromChromeId = async (chromeId: number, t?: Transaction) => {
  const tabs = await db.visits.where("chromeId").equals(chromeId).toArray();
  if (tabs.length > 1)
    throw new Error(
      `Found ${tabs.length} tabs with the same chromeId (${chromeId})`
    );
  if (tabs.length === 0)
    throw new Error(`Unable to find tab with the chromeId ${chromeId}`);

  return tabs[0] as ActiveVisit;
};

const windowFromChromeId = async (chromeId: number, t?: Transaction) => {
  const windows = await db.windows.where("chromeId").equals(chromeId).toArray();
  if (windows.length > 1)
    throw new Error(
      `Found ${windows.length} tabs with the same chromeId (${chromeId})`
    );
  if (windows.length === 0)
    throw new Error(`Unable to find tab with the chromeId ${chromeId}`);

  return windows[0];
};

/** Register that a new tab is in fact the new tab page
 * Since it's indistinguishable from chrome system pages to us
 */
const newTabOpen = (chromeId: number) => {
  db.transaction("rw", db.visits, async (t) => {
    const tab = await tabFromChromeId(chromeId);
    await db.visits.update(tab, {
      isNewTabPage: true,
    });
  });
};

const addTab = async (tab: chrome.tabs.Tab) => {
  console.log("addTab", tab);

  db.transaction("rw", db.visits, db.windows, async (t) => {
    if (
      tab.id === undefined ||
      tab.id === null ||
      tab.id === chrome.tabs.TAB_ID_NONE
    )
      throw new Error("Missing or invalid id on new tab");
    if (
      tab.windowId === undefined ||
      tab.windowId === null ||
      tab.windowId === chrome.windows.WINDOW_ID_NONE
    )
      throw new Error("Missing or invalid window id on tab");

    const window = await windowFromChromeId(tab.windowId);

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
      chromeId: tab.id,
      url: tab.url!,

      status: "active",
      windowId: window.id!,
      chromeWindowId: tab.windowId,

      metadata,
      crawl,
      position,
      state,

      openedAt: new Date(),
      warpspaceOpen: false,
    };

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
  });
};

const updateTab = (
  id: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
) => {
  console.log("updateTab");

  db.transaction("rw", db.visits, db.windows, async (t) => {
    const storedindow = await windowFromChromeId(tab.windowId);
    const storedTab = await tabFromChromeId(id);

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
        db.visits.delete(storedTab.id!);
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

      // Adds new visit
      db.visits.put(openingVisit);
    } else {
      // Url didn't change, so this must be a plain update
      var newTab: ActiveVisit = {
        ...(storedTab as ActiveVisit),
        url: tab.url!,
        metadata,
        position,
        state,
      };
      // Push db changes to both window and tab
      db.visits.update(newTab.id!, { metadata, position, state });
    }
  });
};

const moveTab = (id: number, moveInfo: chrome.tabs.TabMoveInfo) => {
  console.log("moveTab!", id, moveInfo);

  db.transaction("rw", db.visits, db.windows, async (t) => {
    console.log("intrans");
    const storedTab = await tabFromChromeId(id);

    if (moveInfo.windowId !== storedTab.chromeWindowId)
      throw new Error(
        "bad windowid: " + moveInfo.windowId + " vs " + storedTab.windowId
      );

    const storedWindow = await windowFromChromeId(storedTab.chromeWindowId);

    const otherTabs = await db.visits
      .where("chromeWindowId")
      .equals(storedTab.chromeWindowId)
      .toArray();

    const tabList = otherTabs.sort(
      (a, b) => a.position.index - b.position.index
    );

    console.log("Before move, ", tabList);
    //Move the tab in our local state
    tabList.splice(moveInfo.fromIndex, 1);
    tabList.splice(moveInfo.toIndex, 0, storedTab);

    console.log("After move, ", tabList);

    tabList.forEach((t, i) => {
      t.position.index = i;
      db.visits.update(t.id!, { position: t.position });
    });
  }).catch(console.error);
};

const updatePreview = (id: number, previewImage: string) => {
  console.log("updatePreview");
  // var storedTab = tabLookup[id];
  // storedTab.previewImage = previewImage;
  // db.tabs.update(storedTab.UUID, { previewImage });
  // onStateChanged.fire({});
};

const removeTab = async (id: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
  console.log("removeTab");

  db.transaction("rw", db.visits, db.windows, async (t) => {
    const storedTab = await tabFromChromeId(id);

    if (removeInfo.windowId !== storedTab.chromeWindowId)
      throw new Error(
        "Bad windowid: " + removeInfo.windowId + " vs " + storedTab.windowId
      );

    const otherTabs = await db.visits
      .where("chromeWindowId")
      .equals(storedTab.chromeWindowId)
      .toArray();

    const tabList = otherTabs.sort(
      (a, b) => a.position.index - b.position.index
    );

    console.log("Before move, ", tabList);

    tabList.splice(storedTab.position.index, 1);

    console.log("After move, ", tabList);

    tabList.forEach((t, i) => {
      t.position.index = i;
      db.visits.update(t.id!, { position: t.position });
    });

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
      db.visits.delete(storedTab.id!);
    }
  }).catch(console.error);
};

const attachTab = (id: number, attachInfo: chrome.tabs.TabAttachInfo) => {
  console.log("attachTab");
  // We don't do anything on detach, so we need to complete the entire
  // move between windows here

  db.transaction("rw", db.visits, db.windows, async (t) => {
    const storedTab = await tabFromChromeId(id);

    const newStoredWindow = await windowFromChromeId(attachInfo.newWindowId);
    // const oldStoredWindow = await windowFromChromeId(storedTab.chromeWindowId);

    const oldSiblingTabs = await db.visits
      .where("chromeWindowId")
      .equals(storedTab.chromeWindowId)
      .toArray();

    const newSiblingTabs = await db.visits
      .where("chromeWindowId")
      .equals(attachInfo.newWindowId)
      .toArray();

    const newTabList = newSiblingTabs.sort(
      (a, b) => a.position.index - b.position.index
    );
    newTabList.splice(attachInfo.newPosition, 0, storedTab);
    newTabList.forEach((t, i) => {
      t.position.index = i;
      db.visits.update(t.id!, { position: t.position });
    });

    const oldTabList = oldSiblingTabs.sort(
      (a, b) => a.position.index - b.position.index
    );
    oldTabList.splice(storedTab.position.index, 1);
    oldTabList.forEach((t, i) => {
      t.position.index = i;
      db.visits.update(t.id!, { position: t.position });
    });

    db.visits.update(storedTab.id!, {
      windowId: newStoredWindow.id!,
      chromeWindowId: attachInfo.newWindowId,
    });
  }).catch(console.error);
};

const addWindow = (window: chrome.windows.Window) => {
  console.log("addWindow", window);
  const storedWindow: AnonymousWindow = {
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

  db.windows.add(storedWindow);
};

const windowFocusChanged = (chromeId: number) => {
  console.log("windowFocusChanged");

  // db.windows.where("focused").equals("true")

  //   db.windows.update(v.id, { focused: v.focused });
};

/*updateWindow(id: number, changes: any) {
    //Object.assign(windows[id].tabs[tab.id], changeInfo);
    onStateChanged.fire({});
  }*/

const removeWindow = (id: number) => {
  console.log("removeWindow");
  //const storedWindow = windows[id];

  // state = state.filter((n) => n.chromeId !== id);
  // delete windows[id];

  // TODO check that all tabs are gone.

  db.transaction("rw", db.windows, async (t) => {
    const window = await windowFromChromeId(id);
    const closedWindow: WWindow = {
      ...window,
      status: "closed",
      activeAt: new Date(),
    };
    await db.windows.put(closedWindow);
  });
};

const captureTab = async () => {
  var t0 = performance.now();
  const tab = (
    await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    })
  )[0];
  const storedTab = await tabFromChromeId(tab.id!);

  console.log("Query tab: ", performance.now() - t0);

  t0 = performance.now();

  const startTime = Date.now();

  var im = await captureVisibleTab(
    { windowId: tab.windowId },
    async (partial) => {
      // console.log("Partial done: ", performance.now() - t0);
      // // if (previewCaptureLastInvalidatedAt - startTime > -100) return;
      // const key = makeid(10);
      // imageStore.store(key, im);
      // if (((await db.visits.get(cur.id)) as ActiveVisit).warpspaceOpen) return;
      // cur.state.active = true;
      // cur.crawl = {
      //   ...cur.crawl,
      //   lod: 1,
      //   previewImage: key,
      // };
      // db.visits.update(cur.id, {
      //   crawl: cur.crawl,
      //   state: cur.state,
      // });
    }
  );
  // console.error(
  //   previewCaptureLastInvalidatedAt,
  //   previewCaptureLastInvalidatedAt > startTime ? " > " : " <= ",
  //   startTime,
  //   previewCaptureLastInvalidatedAt - startTime
  // );
  // if (previewCaptureLastInvalidatedAt - startTime > -100) return;
  // console.log("Capturevisibletab: ", performance.now() - t0);
  t0 = performance.now();
  const key = makeid(10);
  await imageStore.store(key, im);
  console.log("store: ", performance.now() - t0);
  t0 = performance.now();
  //TODO refactor
  // if (((await db.visits.get(cur.id)) as ActiveVisit).warpspaceOpen) return;

  storedTab.state.active = true;
  storedTab.crawl = {
    ...storedTab.crawl,
    lod: 1,
    previewImage: key,
  };
  db.visits.update(storedTab.id!, {
    crawl: storedTab.crawl,
    state: storedTab.state,
  });
  console.log("write to dexie: ", performance.now() - t0);
  t0 = performance.now();
};

const activateTab = async (activeInfo: chrome.tabs.TabActiveInfo) => {
  console.log("activateTab", activeInfo);
  // TODO is this needed?
  // // previewCaptureLastInvalidatedAt = Date.now();
  // const workStartedAt = Date.now();
  // setTimeout(async () => {
  //   var t0 = performance.now();
  //   var im = await captureVisibleTab(
  //     { windowId: activeInfo.windowId },
  //     () => {}
  //   );

  //   const key = makeid(10);
  //   await imageStore.store(key, im);

  //   const prev = windows[activeInfo.windowId].tabs.find(
  //     (n) => n.state.active === true
  //   );
  //   const cur = tabs[activeInfo.tabId];

  //   cur.state.active = true;

  //   cur.crawl = {
  //     ...cur.crawl,
  //     lod: 1,
  //     previewImage: key,
  //   };

  //   db.visits.update(cur.id, {
  //     crawl: cur.crawl,
  //     state: cur.state,
  //   });
  //   if (prev) {
  //     prev.state.active = false;
  //     db.visits.update(prev.id, {
  //       state: prev.state,
  //     });
  //   }
  // }, 100);
};

export function attachListeners() {
  chrome.windows.onRemoved.addListener(removeWindow);
  chrome.windows.onCreated.addListener(addWindow);
  chrome.windows.onFocusChanged.addListener(windowFocusChanged);
  chrome.tabs.onCreated.addListener(addTab);
  chrome.tabs.onRemoved.addListener(removeTab);
  chrome.tabs.onMoved.addListener(moveTab);
  chrome.tabs.onUpdated.addListener(updateTab);
  chrome.tabs.onAttached.addListener(attachTab);
  chrome.tabs.onActivated.addListener(activateTab);
  chrome.runtime.onMessage.addListener((m, sender, sendResponse) => {
    if (m.event === "request-capture") {
      console.warn("capture requested");
      captureTab();
    }
    if (m.event === "new-tab-open") {
      newTabOpen(sender.tab!.id!);
    }
    if (m.event === "content-scraped") {
      indexTextContent(sender.tab!.id!, m.data);
    }
    if (m.event === "request-search") {
      searchIndex.processSearch(m.data).then(sendResponse);
      return true;
    }
    if (m.event === "register-warpspace-open") {
      // previewCaptureLastInvalidatedAt = Date.now();
      db.visits
        .where("chromeId")
        .equals(sender.tab!.id!)
        .toArray()
        .then((t) => {
          console.warn("register");
          // if (t[0]) db.visits.update(t[0].id, { warpspaceOpen: true });
          console.info(
            "INFO: ",
            "warpspace open",
            (t[0] as ActiveVisit).metadata.title
          );
        })
        .catch((e) => console.error(e));
    }
    if (m.event === "register-warpspace-closed") {
      // previewCaptureLastInvalidatedAt = Date.now();
      // db.visits
      //   .where("chromeId")
      //   .equals(sender.tab!.id!)
      //   .toArray()
      //   .then((t) => {
      //     if (t[0])
      //       db.visits.update(t[0].id, {
      //         warpspaceOpen: false,
      //         warpspaceLastOpen: new Date(),
      //       });
      //     console.info(
      //       "INFO: ",
      //       "warpspace closed",
      //       (t[0] as ActiveVisit).metadata.title
      //     );
      //   })
      //   .catch((e) => console.error(e));
    }
  });
}

export async function initializeTabStore() {
  console.warn("GetInitialData");
  var windows = await chrome.windows.getAll({ populate: true });

  windows.forEach((w) => {
    addWindow(w);
    w.tabs!.forEach((t) => {
      addTab(t);
    });
  });
}
