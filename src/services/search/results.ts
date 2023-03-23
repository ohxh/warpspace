import { SearchFunction } from "./search";

export interface WarpspaceCommand {
  id: string;
  type: "command" | "custom" | "content";

  title: string;
  body: string;
  url: string;

  icon?: React.FunctionComponent;

  placeholder?: string;

  perform?: (() => Promise<unknown>) | (() => void) | (() => Promise<string>);
  children?: SearchFunction;
}

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

/** Candidate (or command from other source) expanded with actual item, 
action, children.
*/
export interface SearchAction {
  id: string | number;
  type:
    | "page"
    | "note"
    | "visit"
    | "command"
    | "window"
    | "custom"
    | "setting"
    | "content";

  title: string;
  body: string;
  url: string;

  placeholder?: string;

  item?: any;

  perform?: (() => Promise<unknown>) | (() => void) | (() => Promise<string>);
  children?: SearchFunction;
}

/** Final result sent to the user, that they can actually do something with.
  Ranked and highlighted.
*/
export interface SearchActionResult {
  type:
    | "page"
    | "note"
    | "visit"
    | "command"
    | "window"
    | "custom"
    | "setting"
    | "content";

  title: string;
  body: string;
  url: string;

  icon?: React.FunctionComponent;

  item?: any;

  perform?: (() => Promise<unknown>) | (() => void) | (() => Promise<string>);
  children?: SearchFunction;
  placeholder?: string;

  debug: any;
}

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
