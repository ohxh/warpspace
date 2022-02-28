import Dexie from "dexie";

export type PageCrawl = L1PageCrawl | L2PageCrawl | L3PageCrawl;

export interface L1PageCrawl extends Omit<L2PageCrawl, "lod"> {
  lod: 1;
  /** HTML string of simplified content of the page (reader mode ish) */
  content?: string;
}

export interface L2PageCrawl extends Omit<L3PageCrawl, "lod"> {
  lod: 2;
  /** Captured image, hopefully close to scroll position */
  previewImage?: string;
  scrollX?: number;
  scrollY?: number;
}

export interface L3PageCrawl {
  lod: 3;
  siteName?: string;
  description?: string;

  // Todo: opengraph / other metadata (language)
}

// Metadata posessed by chrome
export interface PageMetadata {
  title?: string;
  favIconUrl?: string;
  url: string;
}

// Things we should store and restore
export interface ChromeTabPosition {
  index: number;
  groupId: number;
  muted: boolean;
  pinned: boolean;
}

// Things we only observe
export interface ChromeTabState {
  pendingUrl?: string;
  status: "unloaded" | "loading" | "complete";
  audible: boolean;
  active: boolean;
}

export interface Page {
  status: "full";
  url: string;

  metadata: PageMetadata;
  crawl: PageCrawl;

  activeAt: Date;

  searchId?: number;
}

/** Visit that is ongoing */
export interface ActiveVisit {
  /** Warpspace id, *not* chrome one */
  id: number;
  chromeId: number;
  url?: string;

  status: "active";
  /** Warpspace id, *not* chrome one */
  windowId: number;
  chromeWindowId: number;

  // Store these here, and write through to the page db
  // That way, we support multiple tabs at the same URI with
  // different attributes
  metadata: PageMetadata;
  crawl: PageCrawl;

  position: ChromeTabPosition;
  state: ChromeTabState;

  openedAt: Date;

  isNewTabPage?: boolean;

  searchId?: number;

  warpspaceOpen: boolean;
}

export interface SuspendedVisit {
  id: number;
  url: string;

  status: "suspended";
  windowId: number;

  // Store these here, and write through to the page db
  // That way, we support multiple tabs at the same URI with
  // different attributes
  metadata: PageMetadata;
  crawl: PageCrawl;
  position: ChromeTabPosition;
  state: ChromeTabState;

  openedAt: Date;
  activeAt: Date;
}

export interface ClosedVisit {
  id: number;

  status: "closed";

  windowId: number;
  url: string;

  // Keep last values in case restored
  position: ChromeTabPosition;

  openedAt: Date;
  activeAt: Date;
}

export type Visit = SuspendedVisit | ActiveVisit | ClosedVisit;

export interface AnonymousWindow {
  id: number;
  type: "anonymous";
  chromeId: number;

  status: "open" | "closed";
  focused: boolean;

  height: number;
  width: number;
  top: number;
  left: number;

  createdAt: Date;
  activeAt: Date;
}

export interface FullWindow {
  id: number;
  type: "full";
  chromeId: number;

  title: string;

  status: "open" | "closed";
  focused: boolean;

  height: number;
  width: number;

  top: number;
  left: number;

  createdAt: Date;
  activeAt: Date;
}

export type WWindow = FullWindow | AnonymousWindow;

export class WarpspaceDatabase extends Dexie {
  visits!: Dexie.Table<Visit, number>;
  pages!: Dexie.Table<Page, string>;
  windows!: Dexie.Table<WWindow, number>;

  constructor() {
    super("WarpspaceDatabase");
    this.version(1).stores({
      visits: "&id, chromeId, activeAt, status, searchId",
      pages: "&url, chromeId, activeAt, status, searchId",
      windows: "&id, chromeId, activeAt, status, searchId",
    });
  }
}

export const db = new WarpspaceDatabase();

// db.windows.clear();
// db.pages.clear();
// db.visits.clear();

// Flexsearch of
// Website text avg. 15k

// Metadata, photo, summary, search index -- 1000?
// Metadata, photo, summary -- infinite
// Metadata, photo -- infinite

/*

1. Prefix context search on all
2. Prefix search on title, context search on body
3. Prefix search on title, basic search on body
4. Prefix search on title, flat lookup on body if match
5. Prefix search on title

*/
