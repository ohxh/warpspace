import { Page, TrackedVisit, TrackedWindow } from "../database/DatabaseSchema";
import { SearchFunction } from "./search";

/** 
   Result referring to an item in the index. May correspond to multiple
    final results (i.e. multiple tabs open with same url).
*/
export type SearchCandidate = {
  id: number;
  score: number;

  title: string;
  body: string;
  url: string;
};

/** Final result sent to the user, that they can actually do something with.
  Ranked and highlighted.
*/
export interface BaseSearchActionResult {
  id?: any;

  type: "page" | "command" | "window" | "custom" | "setting" | "content";

  title: string;
  body: string;
  url: string;

  hidePreviewPanel?: boolean;

  icon?: React.FunctionComponent;

  perform?:
    | (() => SearchActionResult[])
    | (() => Promise<SearchActionResult[]>)
    | (() => Promise<void>)
    | (() => void);
  children?: SearchFunction;
  placeholder?: string;

  debug?: any;
}

export interface PageSearchActionResult extends BaseSearchActionResult {
  type: "page";
  item: Page;
  visits: TrackedVisit[];
}

export interface CommandSearchActionResult extends BaseSearchActionResult {
  type: "command";
}

export interface ContentSearchActionResult extends BaseSearchActionResult {
  type: "content";
  index: number;
  allFrags: string[];
}

export interface CustomSearchActionResult extends BaseSearchActionResult {
  type: "custom";
}

export interface WindowSearchActionResult extends BaseSearchActionResult {
  type: "window";
  item: TrackedWindow;
}

export type SearchActionResult =
  | PageSearchActionResult
  | WindowSearchActionResult
  | CommandSearchActionResult
  | ContentSearchActionResult
  | CustomSearchActionResult;

/** Group by type, ordered by best item in group */
export function groupResults(
  results: SearchActionResult[]
): (SearchActionResult | string)[] {
  const groups: { type: string; results: SearchActionResult[] }[] = [];

  results.forEach((r) => {
    let group = groups.find((g) => g.type === r.type);

    //@ts-ignore
    if (group) group.results.push(r, ...(r.inline || []));
    //@ts-ignore
    else groups.push({ type: r.type, results: [r, ...(r.inline || [])] });
  });

  // Hide heading for custom items
  return groups.flatMap((g) =>
    g.type === "custom" ? g.results : [g.type, ...g.results]
  );
}

// GRadeint

/*

radial-gradient(800px at 700px 200px, color(display-p3 0.983 0.971 0.993), rgba(0, 0, 0, 0)), radial-gradient(600px at calc(100% - 300px) 300px, color(display-p3 0.912 0.956 0.991), rgba(0, 0, 0, 0)), radial-gradient(800px at right center, color(display-p3 0.899 0.963 0.989), rgba(0, 0, 0, 0)), radial-gradient(800px at right bottom, color(display-p3 0.98 0.995 0.999), rgba(0, 0, 0, 0)), radial-gradient(800px at calc(50% - 600px) calc(100% - 100px), color(display-p3 0.981 0.917 0.96), color(display-p3 0.998 0.989 0.996), rgba(0, 0, 0, 0))

linear-gradient(120deg, color(display-p3 0.767 0.814 0.995), color(display-p3 0.953 0.813 0.864))

*/
