import { TrackedTab } from "../../database/DatabaseSchema";
import { rank } from "../rank";
import { WarpspaceCommand, SearchCandidate, groupResults } from "../results";
import { SearchFunction } from "../search";

export const makeTabSearch: (w: TrackedTab) => SearchFunction =
  (w: TrackedTab) => async (query: string) => {
    let commands: WarpspaceCommand[] = [];
    const items: SearchCandidate[] = [];

    const ranked = rank(query, [...items, ...commands]);

    return groupResults(ranked);
  };
