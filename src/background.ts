import Dexie from "dexie";
import {
  ChromeTabPosition,
  ChromeTabState,
  ClosedTab,
  db,
  OpenVisit,
  Page,
  PageMetadata,
  TrackedVisit,
  TrackedWindow,
} from "./services/database/DatabaseSchema";
import { error, info, log, Timer, warn } from "./services/logging/log";
import {
  captureVisibleTab,
  compressCapturedPreview,
} from "./services/previews/CaptureVisibleTab";
import { ImageStore } from "./services/previews/ImageStore";
import { index } from "./services/search/DexieSearchIndex";
import { normalizeURL, stripHash } from "./utils/normalizeUrl";

export const indexHistory = async (progress: (x: number) => void) => {
  console.error("Getting history");
  chrome.history.search(
    {
      text: "",
      startTime: 0,
      maxResults: 100000,
    },
    async (results) => {
      const t00 = performance.now();
      console.error("Got results");
      progress(2);

      const map: Map<string, Page> = new Map();

      results.forEach((r) => {
        if (!r.url || !r.lastVisitTime) return;
        if (r.url.includes("google.com/search")) return;

        const strippedUrl = new URL(r.url);
        strippedUrl.hash = "";

        const url = strippedUrl.href.slice(0, 200);

        const existing = map.get(url);

        if (existing) {
          existing.ranking.activeAt = new Date(
            Math.max(r.lastVisitTime, existing.ranking.activeAt.getTime())
          );
        } else {
          map.set(url, {
            url: url,
            ranking: {
              visitCount: r.visitCount || 0,
              typedCount: r.typedCount || 0,
              activeAt: new Date(r.lastVisitTime),
            },
            searchId: parseInt(r.id) + 999999,
            metadata: {
              title: r.title || "",
            },
            type: "page",
          });
        }
      });

      progress(10);

      let array = [...map.values()];

      await Promise.all([
        db.pages.bulkPut(array),
        index.indexAll(
          array.map((r) => ({
            id: r.searchId,
            title: r.metadata.title || "",
            url: r.url?.slice(0, 100) || "",
            body: "",
            type: "page",
          }))
        ),
      ]);

      db.global.put({ id: "global" });
    }
  );
};

const makeid = (x: any) => Date.now().toString();

/** Whether we are currently capturing a preview, and should ignore other requests. */
let capturingPreview = false;
/** Set to true when any event that would invalidate a preview occurs. */
let previewInvalidated = false;

/** Wrapper to get around dexie not typing auto-incremented keys right */
const addTabToDB = (x: Omit<TrackedVisit, "id">) =>
  db.tabs.add(x as TrackedVisit);
const addWindowToDB = (x: Omit<TrackedWindow, "id">) =>
  db.windows.add(x as TrackedWindow);

const writeTabThroughToPages = async (x: Omit<TrackedVisit, "id">) => {
  const url = normalizeURL(x.url);
  let oldPage = await db.pages.get(url);

  // make a search id if needed
  let searchId = oldPage?.searchId ?? Math.floor(Math.random() * 4294967295);

  if (oldPage) {
    await db.pages.update(url, {
      metadata: x.metadata,
      activeAt: x.activeAt,
    });
  } else {
    await db.pages.add({
      url,
      type: "page",
      metadata: x.metadata,
      ranking: {
        activeAt: x.activeAt,
        typedCount: 0,
        visitCount: 1,
      },
      searchId,
    });
  }

  // If the title / url changed, update them in the search index
  if (x.metadata.title !== oldPage?.metadata.title || url !== oldPage?.url) {
    // console.log("Indexing on write-through", oldPage, x);
    index.index(searchId, {
      title: x.metadata.title,
      url,
      type: "page",
    });
  }
};

// Listen for the command to open search, and notify the active tab
chrome.commands.onCommand.addListener(async (c) => {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  if (tab) {
    chrome.tabs.sendMessage(tab.id!, { event: "enter-search" });
  } else
    chrome.windows.create({
      height: 400,
      width: 400,
      top: 100,
      type: "popup",
      url: chrome.runtime.getURL("search.html"),
    });
});

const initialized = initializeTabStore();

export type HydratedTrackedWindow = TrackedWindow & {
  tabs: (OpenVisit & { id: number })[];
  id: number;
  chromeId: number;
};

const imageStore = new ImageStore();

const tabFromChromeId = async (chromeId: number) => {
  const tabs = await db.tabs.where("chromeId").equals(chromeId).toArray();
  if (tabs.length > 1)
    throw new Error(
      `Found ${tabs.length} tabs with the same chromeId (${chromeId})`
    );
  if (tabs.length === 0)
    throw new Error(`Unable to find tab with the chromeId ${chromeId}`);

  return tabs[0] as OpenVisit;
};

const windowFromChromeId = async (chromeId: number) => {
  const windows = await db.windows.where("chromeId").equals(chromeId).toArray();
  if (windows.length > 1)
    throw new Error(
      `Found ${windows.length} tabs with the same chromeId (${chromeId})`
    );
  if (windows.length === 0)
    throw new Error(`Unable to find tab with the chromeId ${chromeId}`);

  return windows[0];
};

/**
 * Register that a new tab is in fact the new tab page
 * Since it's indistinguishable from chrome system pages to us
 */
const newTabOpen = async (chromeId: number) => {
  console.log("newTabOpen()");
  await db
    .transaction("rw", db.tabs, async (t) => {
      const tab = await tabFromChromeId(chromeId);
      await db.tabs.update(tab, {
        isNewTabPage: true,
        "metadata.title": "New Tab",
        "metadata.faviconURL": chrome.runtime.getURL("/icon.svg"),
        updatedAt: new Date(),
      });
    })
    .catch((x) => console.error("Error newTabOpen()", x));
  tabFromChromeId(chromeId).then((x) => console.log("FAVIO", x));
};

/** Add a tab */
const addTab = async (tab: chrome.tabs.Tab, instant?: boolean) => {
  if (!instant) await initialized;

  const t = performance.now();

  await db
    .transaction("rw", db.tabs, db.windows, db.pages, async (t) => {
      if (
        tab.id === undefined ||
        tab.id === null ||
        tab.id === chrome.tabs.TAB_ID_NONE
      )
        throw new Error("Missing or invalid Chrome id on new tab.");
      if (
        tab.windowId === undefined ||
        tab.windowId === null ||
        tab.windowId === chrome.windows.WINDOW_ID_NONE
      )
        throw new Error("Missing or invalid Chrome window id on tab.");

      const window = await windowFromChromeId(tab.windowId);
      const otherTabs = (await db.tabs
        .where("chromeWindowId")
        .equals(tab.windowId)
        .toArray()) as OpenVisit[];

      // Bump up later indices
      const promises = otherTabs
        .filter((t) => t.position.index >= tab.index)
        .map((t) =>
          db.tabs.update(t.id, { "position.index": t.position.index + 1 })
        );

      await Dexie.Promise.all(promises);

      const metadata: PageMetadata = {
        title: tab.title,
      };

      const position: ChromeTabPosition = {
        index: tab.index,
        groupId: tab.groupId,
        muted: tab.mutedInfo?.muted || false,
        pinned: tab.pinned,
      };

      const state: ChromeTabState = {
        status: tab.status as "loading" | "complete",
        audible: tab.audible || false,
        active: tab.active,
      };

      var newTab: Omit<OpenVisit, "id"> = {
        type: "visit",
        status: "open",

        chromeId: tab.id,
        url: normalizeURL(tab.url || tab.pendingUrl || ""),

        windowId: window.id,
        chromeWindowId: tab.windowId,

        metadata,
        position,
        state,

        searchOpen: false,

        openedAt: new Date(),
        activeAt: new Date(),
        updatedAt: new Date(),
      };

      if (!newTab.url) {
        newTab.metadata.title = "Chrome";
        newTab.metadata.faviconURL = chrome.runtime.getURL("/logo.png");
      }

      // Push db changes to both window and tab
      await addTabToDB(newTab);
      await writeTabThroughToPages(newTab);
    })
    .catch((x) => error(`Failed to add tab to DB`, x, { instant, tab }));

  if (!instant)
    info(
      `Added tab ${
        tab.title ? '"' + tab.title + '"' : "[no title]"
      } (chromeId ${tab.id}) to store.`,
      tab,

      `⌛ ${performance.now() - t}ms`
    );
};

const updateTab = async (
  id: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
) => {
  await initialized;
  const t = performance.now();

  await db
    .transaction("rw", db.tabs, db.windows, db.pages, async (t) => {
      const storedTab = await tabFromChromeId(id);

      info("Changed coming!", storedTab, changeInfo);

      const metadata: PageMetadata = {
        title: changeInfo.title || storedTab.metadata.title,
        faviconURL: changeInfo.favIconUrl || storedTab.metadata.faviconURL,
        previewImage: storedTab.metadata.previewImage,
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

      let newUrl = normalizeURL(changeInfo.url || storedTab.url);

      if (newUrl !== storedTab.url) {
        // If the URL used to be blank, then just forget about the old visit.
        if (storedTab.url === "") {
          info(
            "Detected navigation from blank tab, deleting old visit",
            newUrl,
            storedTab.url
          );
          await db.tabs.delete(storedTab.id);
        } else {
          // Otherwise, store the closing tab
          info("Detected navigation, closing old visit"), newUrl, storedTab.url;
          var closingVisit: ClosedTab = {
            type: "visit",
            status: "closed",

            id: storedTab.id,

            windowId: storedTab.windowId,
            url: storedTab.url,
            openedAt: storedTab.openedAt,

            metadata: storedTab.metadata,
            position: storedTab.position,

            closingReason: "navigated",
            // Last active now, i.e. when closed
            activeAt: new Date(),
            closedAt: new Date(),
            updatedAt: new Date(),
          };

          // Overwrite old active visit
          await db.tabs.put(closingVisit);
        }

        // Create a new visit
        var openingVisit: Omit<OpenVisit, "id"> = {
          type: "visit",
          status: "open",

          chromeId: id,

          windowId: storedTab.windowId,
          url: newUrl,
          position,
          state,
          metadata,
          chromeWindowId: tab.windowId,

          searchOpen: false,

          openedAt: new Date(),
          activeAt: new Date(),
          updatedAt: new Date(),
          //@ts-expect-error
          didOpen: "true",
        };

        info(
          "Detected URL change, adding visit",
          newUrl,
          storedTab.url,
          openingVisit
        );

        await addTabToDB(openingVisit);
        await writeTabThroughToPages(openingVisit);
      } else {
        info("Detected update, no URL change", newUrl, storedTab.url);
        // Url didn't change substantially, so this must be a plain update
        var newTab: OpenVisit = {
          ...(storedTab as OpenVisit),
          url: newUrl,
          metadata,
          position,
          state,
          updatedAt: new Date(),
        };

        await writeTabThroughToPages(newTab);
        await db.tabs.update(storedTab.id, newTab);
      }
    })
    .catch((x) => console.error("updateTab()", x));

  info("Tab updated", changeInfo, tab.id, `⌛ ${performance.now() - t}ms`);
};

const moveTab = async (id: number, moveInfo: chrome.tabs.TabMoveInfo) => {
  await initialized;
  const t = performance.now();

  await db
    .transaction("rw", db.tabs, db.windows, async (t) => {
      const storedTab = await tabFromChromeId(id);

      if (moveInfo.windowId !== storedTab.chromeWindowId)
        throw new Error(
          "bad windowid: " + moveInfo.windowId + " vs " + storedTab.windowId
        );

      const otherTabs = (await db.tabs
        .where("chromeWindowId")
        .equals(storedTab.chromeWindowId)
        .toArray()) as OpenVisit[];

      const tabList = otherTabs.sort(
        (a, b) => a.position.index - b.position.index
      );

      //Move the tab in our local state
      tabList.splice(moveInfo.fromIndex, 1);
      tabList.splice(moveInfo.toIndex, 0, storedTab);

      await Dexie.Promise.all(
        tabList.map(async (t, i) => {
          if (t.position.index == i) return;
          return db.tabs.update(t.id, {
            "position.index": i,
            updatedAt: new Date(),
          });
        })
      );
    })
    .catch((x) => console.error("moveTab()", x));

  info(
    `Tab ${id} moved ${moveInfo.fromIndex}->${moveInfo.toIndex}`,
    `⌛ ${performance.now() - t}ms`
  );
};

const removeTab = async (id: number, removeInfo: chrome.tabs.TabRemoveInfo) => {
  await initialized;
  let t = performance.now();
  let tt = performance.now();

  await db
    .transaction("rw", db.tabs, db.windows, db.pages, async (tr) => {
      t = performance.now();

      const storedTab = await tabFromChromeId(id);

      t = performance.now();

      if (removeInfo.windowId !== storedTab.chromeWindowId)
        throw new Error(
          "Bad windowid: " + removeInfo.windowId + " vs " + storedTab.windowId
        );

      const otherTabs = (await db.tabs
        .where("chromeWindowId")
        .equals(storedTab.chromeWindowId)
        .toArray()) as OpenVisit[];

      console.log("got othertabs, ", performance.now() - t);
      t = performance.now();

      const tabList = otherTabs.sort(
        (a, b) => a.position.index - b.position.index
      );

      tabList.splice(storedTab.position.index, 1);

      await Promise.all(
        tabList.map(async (t, i) => {
          if (t.position.index != i)
            db.tabs.update(t.id, { "position.index": i });
        })
      );

      if (storedTab.url) {
        if (removeInfo.isWindowClosing) {
          const suspendingTab: ClosedTab = {
            type: "visit",
            status: "closed",

            metadata: storedTab.metadata,
            position: storedTab.position,

            id: storedTab.id,
            windowId: storedTab.windowId,
            url: storedTab.url,
            openedAt: storedTab.openedAt,

            closingReason: "window-closed",

            closedAt: new Date(),
            activeAt: new Date(),
            updatedAt: new Date(),
          };

          await db.tabs.put(suspendingTab);
        } else {
          const closingTab: ClosedTab = {
            type: "visit",
            status: "closed",

            metadata: storedTab.metadata,
            position: storedTab.position,

            id: storedTab.id,
            windowId: storedTab.windowId,
            url: storedTab.url,
            openedAt: storedTab.openedAt,

            closingReason: "tab-closed",

            activeAt: new Date(),
            closedAt: new Date(),
            updatedAt: new Date(),
          };

          await db.tabs.put(closingTab);
        }

        await db.pages.update(storedTab.url, { activeAt: new Date() });
        console.log("put storedtab, ", performance.now() - t);
        t = performance.now();
      } else {
        await db.tabs.delete(storedTab.id);
        console.log("deleted storedtab, ", performance.now() - t);
        t = performance.now();
      }

      info(`Tab ${id} removed`, `⌛ ${performance.now() - tt}ms`);
    })
    .catch(error);
};

const attachTab = async (id: number, attachInfo: chrome.tabs.TabAttachInfo) => {
  await initialized;
  const t = performance.now();
  // We don't do anything on detach, so we need to complete the entire
  // move between windows here

  await db
    .transaction("rw", db.tabs, db.windows, async (t) => {
      const storedTab = await tabFromChromeId(id);

      const newStoredWindow = await windowFromChromeId(attachInfo.newWindowId);
      // const oldStoredWindow = await windowFromChromeId(storedTab.chromeWindowId);

      const oldSiblingTabs = (await db.tabs
        .where("chromeWindowId")
        .equals(storedTab.chromeWindowId)
        .toArray()) as OpenVisit[];

      const newSiblingTabs = (await db.tabs
        .where("chromeWindowId")
        .equals(attachInfo.newWindowId)
        .toArray()) as OpenVisit[];

      const newTabList = newSiblingTabs.sort(
        (a, b) => a.position.index - b.position.index
      );
      newTabList.splice(attachInfo.newPosition, 0, storedTab);
      newTabList.forEach((t, i) => {
        t.position.index = i;
        db.tabs.update(t.id, {
          position: t.position,
          updatedAt: new Date(),
        });
      });

      const oldTabList = oldSiblingTabs.sort(
        (a, b) => a.position.index - b.position.index
      );
      oldTabList.splice(storedTab.position.index, 1);
      await Dexie.Promise.all(
        oldTabList.map((t, i) => {
          t.position.index = i;
          return db.tabs.update(t.id, {
            position: t.position,
            updatedAt: new Date(),
          });
        })
      );

      await db.tabs.update(storedTab.id, {
        windowId: newStoredWindow.id,
        chromeWindowId: attachInfo.newWindowId,
        updatedAt: new Date(),
      });
    })
    .catch((x) => console.error("AttachTab()", x));

  info("Tab attached", `⌛ ${performance.now() - t}ms`);
};

const addWindow = async (window: chrome.windows.Window, instant?: boolean) => {
  if (!instant) await initialized;
  const t = performance.now();

  const newWindow: Omit<TrackedWindow, "id"> = {
    type: "window",
    chromeId: window.id!,

    focused: window.focused,

    title: "",

    status: "open",

    position: {
      height: window.height!,
      width: window.width!,
      top: window.top!,
      left: window.left!,
    },

    createdAt: new Date(),
    activeAt: new Date(),

    ranking: {
      activeAt: new Date(),
      typedCount: 0,
      visitCount: 1,
    },
  };

  await addWindowToDB(newWindow);

  if (!instant) info("Noticed window added", `⌛ ${performance.now() - t}ms`);
};

const removeWindow = async (id: number) => {
  await initialized;
  const t = performance.now();

  await db
    .transaction("rw", db.windows, async (t) => {
      const window = await windowFromChromeId(id);
      const closedWindow: TrackedWindow = {
        ...window,
        status: "closed",
        activeAt: new Date(),
      };
      await db.windows.put(closedWindow);
    })
    .catch((x) => console.error("RemoveWindow()", x));

  info("Window removed", `⌛ ${performance.now() - t}ms`);
};

const captureTab = async () => {
  await initialized;

  const t = new Timer();

  try {
    if (capturingPreview) {
      warn("Quit captureTab, already capturing");
      return;
    }
    capturingPreview = true;
    previewInvalidated = false;

    const tab = (
      await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      })
    )[0];
    if (!tab) {
      throw new Error("Couldn't find tab to capture");
    }

    const storedTab = await tabFromChromeId(tab.id!);

    t.mark("Got stored tab");

    if (!storedTab.url) {
      throw new Error("No url");
    }
    if (storedTab.searchOpen) {
      throw new Error("Search open");
    }

    var im = await captureVisibleTab({ windowId: tab.windowId });

    t.mark("captureVisibleTab()");

    if (previewInvalidated) {
      throw new Error("Preview invalidated");
    }

    var sc = await compressCapturedPreview(im);

    t.mark("compressCapturedPreview()");

    const key = makeid(10);

    //storedTab.metadata.previewImage ??
    await imageStore.store(key, sc);
    t.mark("imageStore.store()");

    await db.tabs.update(storedTab.id, {
      "metadata.previewImage": key,
    });

    await db.pages.update(storedTab.url, {
      "metadata.previewImage": key,
    });

    t.mark("Update DB");
    t.finish();
  } catch (e) {
    error(e);
    return;
  } finally {
    capturingPreview = false;
    previewInvalidated = false;
  }

  info("Captured tab preview image", t, sc);
};

chrome.tabs.onReplaced.addListener(async (added, removed) => {
  info("onReplaced", added, removed);
  await db
    .transaction("rw", db.tabs, async (tr) => {
      const old = await db.tabs.where("chromeId").equals(removed).toArray();
      if (old.length !== 1)
        throw new Error("Unexpected number of old tabs " + old.length);
      await db.tabs.update(old[0].id, {
        chromeId: added,
        updatedAt: new Date(),
      });
    })
    .catch(console.error);
});
chrome.windows.onRemoved.addListener(removeWindow);
chrome.windows.onCreated.addListener((w) => addWindow(w));
// chrome.windows.onFocusChanged.addListener(windowFocusChanged);
chrome.tabs.onCreated.addListener(addTab);
chrome.tabs.onRemoved.addListener(removeTab);
chrome.tabs.onMoved.addListener(moveTab);
chrome.tabs.onUpdated.addListener(updateTab);
chrome.tabs.onAttached.addListener(attachTab);

// chrome.tabs.onActivated.addListener(activateTab);
chrome.runtime.onMessage.addListener(async (m, sender, sendResponse) => {
  if (m.event === "request-capture") {
    captureTab();
  }
  if (m.event === "new-tab-open") {
    newTabOpen(sender.tab!.id!);
  }
  if (m.event === "content-scraped") {
    const t = new Timer();
    if (!sender.tab?.id) {
      error("No sender ID");
      return;
    }
    let [visit] = await db.tabs
      .where("chromeId")
      .equals(sender.tab.id)
      .toArray();

    t.mark("Get visit");

    if (!visit) {
      error(`No visit with chrome id ${sender.tab.id} to index`);
      return;
    }

    let [page] = await db.pages
      .where("url")
      .equals(normalizeURL(visit.url))
      .toArray();

    t.mark("Get page");

    let searchId = page.searchId;

    index.index(searchId, {
      body: m.data.body,
    });
    t.mark("Index");
    t.finish();

    info("Indexed scraped content", t, m.data);
  }

  if (m.event === "rename-window") {
    db.windows.update(m.data.id, {
      title: m.data.title,
      status: "full",
    });
    // TODO index windows by name
    // db.windows.get(m.data.id).then((TrackedWindow) =>
    //   index.index(`warpspace.app/window/${TrackedWindow!.id}`, {
    //     title: m.data.title,
    //     url: "",
    //     body: "",
    //     type: "window",
    //   })
    // );
    return true;
  }
  if (m.event === "search") {
    return true;
  }
  if (m.event === "search-opened") {
    previewInvalidated = true;

    db.tabs
      .where("chromeId")
      .equals(sender.tab!.id!)
      .toArray()
      .then((t) => {
        if (t[0]) {
          db.tabs.update(t[0].id, { searchOpen: true });
          info("Search open", (t[0] as OpenVisit).metadata.title);
        }
      })
      .catch((e) => console.error(e));
  }
  if (m.event === "search-closed") {
    // previewCaptureLastInvalidatedAt = Date.now();
    db.tabs
      .where("chromeId")
      .equals(sender.tab!.id!)
      .toArray()
      .then((t) => {
        if (t[0])
          db.tabs.update(t[0].id, {
            searchOpen: false,
          });
        info("Search closed", (t[0] as OpenVisit).metadata.title);
      })
      .catch((e) => console.error(e));
  }
});

export async function initializeTabStore() {
  return new Promise<void>(async (resolve) => {
    const t = new Timer();

    var chromeWindows = await chrome.windows.getAll();
    var chromeTabs = await chrome.tabs.query({});

    t.mark("Query current state");

    // Reconcile log of open tabs with current open tabs
    await db
      .transaction("rw", db.tabs, db.windows, db.pages, async (t) => {
        const windows = (await db.windows
          .where("status")
          .equals("open")
          .toArray()) as TrackedWindow[];
        const tabs = (await db.tabs
          .where("status")
          .equals("open")
          .toArray()) as OpenVisit[];

        await Dexie.Promise.all([
          ...chromeWindows.map(async (cw) => {
            if (windows.some((w) => w.chromeId === cw.id)) return;
            await addWindow(cw, true);
          }),
          ...chromeTabs.map(async (ct) => {
            if (tabs.some((t) => t.chromeId === ct.id)) return;
            await addTab(ct, true);
          }),
          ...windows.map(async (w) => {
            if (chromeWindows.some((cw) => cw.id === w.chromeId)) return;
            await db.windows.update(w.id, {
              status: "closed",
              closedAt: new Date(),
            });
          }),
          ...tabs.map(async (v) => {
            if (chromeTabs.some((ct) => ct.id === v.chromeId)) return;
            const cl: ClosedTab = {
              type: "visit",
              status: "closed",
              activeAt: v.activeAt,
              closedAt: new Date(),
              closingReason: "window-closed",

              openedAt: v.openedAt,
              metadata: v.metadata,
              position: v.position,

              url: stripHash(v.url),
              windowId: v.windowId,
              id: v.id,
              updatedAt: new Date(),
            };
            await db.tabs.put(cl);
          }),
        ]);
      })
      .catch(error);

    t.mark("Update Database");
    t.finish();

    info("Initialized database", t);
    resolve();
  });
}

// Inject into all open tabs on install
chrome.runtime.onInstalled.addListener(async () => {
  // db.global.put({ id: "global" });
  //indexHistory((x) => console.error("Progress: ", x)).catch(console.error);

  chrome.tabs.create({ url: chrome.runtime.getURL("intro.html") });

  (await chrome.tabs.query({})).map((t) => {
    if (!t.url) return;
    chrome.scripting.executeScript({
      target: {
        tabId: t.id!,
        allFrames: false,
      },
      files: ["js/content.js"],
    });
    chrome.scripting.insertCSS({
      target: {
        tabId: t.id!,
        allFrames: false,
      },
      files: ["content.css"],
    });
  });
});
