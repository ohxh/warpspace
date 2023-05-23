import { type } from "os";
import { Page, TrackedVisit, TrackedWindow } from "../database/DatabaseSchema";
import { SearchFunction } from "./search";

/** 
   Result referring to an item in the index. May correspond to multiple
    final results (i.e. multiple tabs open with same url).
*/
export type SearchCandidate = {
  id: number;
  score: number;

  type: "page" | "note" | "window";

  title: string;
  body: string;
  url: string;
};

/** Final result sent to the user, that they can actually do something with.
  Ranked and highlighted.
*/
export interface BaseSearchActionResult {
  id?: any;

  type:
    | "page"
    | "visit"
    | "note"
    | "command"
    | "window"
    | "custom"
    | "setting"
    | "content";

  title: string;
  body: string;
  url: string;

  icon?: React.FunctionComponent;

  perform?: (() => Promise<unknown>) | (() => void) | (() => Promise<string>);
  children?: SearchFunction;
  placeholder?: string;

  debug?: any;
}

export interface PageSearchActionResult extends BaseSearchActionResult {
  type: "page";
  item: Page;
}

export interface VisitSearchActionResult extends BaseSearchActionResult {
  type: "visit";
  item: TrackedVisit;
}

export interface NoteSearchActionResult extends BaseSearchActionResult {
  type: "note";
}

export interface CommandSearchActionResult extends BaseSearchActionResult {
  type: "command";
}

export interface ContentearchActionResult extends BaseSearchActionResult {
  type: "content";
  index: number;
  allFrags: string[];
}

export interface WindowSearchActionResult extends BaseSearchActionResult {
  type: "window";
  item: TrackedWindow;
}

export type SearchActionResult =
  | PageSearchActionResult
  | NoteSearchActionResult
  | VisitSearchActionResult
  | WindowSearchActionResult
  | CommandSearchActionResult
  | ContentearchActionResult;

/** Group by type, ordered by best item in group */
export function groupResults(
  results: SearchActionResult[]
): (SearchActionResult | string)[] {
  const groups: { type: string; results: SearchActionResult[] }[] = [];

  results.forEach((r) => {
    const type = r.type === "visit" ? "page" : r.type;
    let group = groups.find((g) => g.type === type);

    //@ts-ignore
    if (group) group.results.push(r, ...(r.inline || []));
    //@ts-ignore
    else groups.push({ type, results: [r, ...(r.inline || [])] });
  });

  // Hide heading for custom items
  return groups.flatMap((g) =>
    g.type === "custom" ? g.results : [g.type, ...g.results]
  );
}
