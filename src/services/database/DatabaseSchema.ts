import Dexie from "dexie";

/** Metadata for use in ranking an item in search results */
export interface RankingMetadata {
  /** Number of visits / unique opens total */
  visitCount: number;

  /** Number of visits coming from a query typed in the omnibox
   * or a query in warpspace. <= visitCount */
  typedCount: number;

  /** Date/time last open */
  activeAt: Date;
}

/** Page specific metadata. */
export interface PageMetadata {
  /** Tab title */
  title?: string;
  /** ID of preview image in LocalImageStore */
  previewImage?: string;
  faviconURL?: string;
}

/** Positioning info we need to store and restore for windows.
 * Values come directly from the browser API. */
export interface ChromeTabPosition {
  index: number;
  groupId: number;
  muted: boolean;
  pinned: boolean;
}

export interface ChromeTab {
  id: number;
  windowId: number;
  index: number;
}

/** State info that doesn't need to be stored but might be displayed */
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
  ranking: RankingMetadata;

  searchId: number;
}

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

export interface OpenVisit extends BaseVisit {
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

export type TrackedVisit = OpenVisit | ClosedTab;

export type TrackedWindow = {
  type: "window";

  status: "open" | "closed";

  id: number;
  chromeId: number;

  title: string;

  searchId: number;

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

  ranking: RankingMetadata;
};

export class WarpspaceDatabase extends Dexie {
  tabs!: Dexie.Table<TrackedVisit, number>;
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
