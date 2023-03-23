import Dexie from "dexie";

// Metadata posessed by chrome
export interface PageMetadata {
  title?: string;
  favIconUrl?: string;
  previewImage?: string;
}

// Things we should store and restore for windows
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
  type: "page";
  url: string;
  metadata: PageMetadata;
  activeAt: Date;
  searchId: number;
}

/** Visit that is ongoing */
export interface BaseVisit {
  type: "visit";

  url: string;

  /** Warpspace id, *not* chrome one */
  id: number;

  /** Warpspace id, *not* chrome one */
  windowId: number;

  // Store these here, and write through to the page db
  // That way, we support multiple tabs at the same URI with
  // different attributes
  metadata: PageMetadata;
  position: ChromeTabPosition;

  openedAt: Date;
  activeAt: Date;
  updatedAt: Date;
}

export interface OpenTab extends BaseVisit {
  status: "open";

  chromeWindowId: number;
  chromeId: number;

  state: ChromeTabState;

  searchOpen: boolean;
}

export interface ClosedTab extends BaseVisit {
  status: "closed";

  closingReason: "tab-closed" | "window-closed" | "navigated";
  navigatedToVisitId?: number;

  closedAt: Date;
}

export type TrackedTab = OpenTab | ClosedTab;

export type TrackedWindow = {
  type: "window";

  status: "open" | "closed";

  id: number;
  chromeId: number;

  title: string;

  focused: boolean;

  position: {
    height: number;
    width: number;
    top: number;
    left: number;
  };

  createdAt: Date;
  activeAt: Date;
  closedAt?: Date;
};

export class WarpspaceDatabase extends Dexie {
  tabs!: Dexie.Table<TrackedTab, number>;
  pages!: Dexie.Table<Page, string>;
  windows!: Dexie.Table<TrackedWindow, number>;
  global!: Dexie.Table<any, string>;

  constructor() {
    super("WarpspaceDatabase");
    this.version(1).stores({
      tabs: "++id, &chromeId, chromeWindowId, windowId, [windowId+status], [url+status], activeAt, status, url",
      pages: "&url, &searchId, activeAt, status",
      windows: "++id, &chromeId, searchId, activeAt, status",
      global: "id",
    });
  }
}

export const db = new WarpspaceDatabase();
