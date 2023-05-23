import { TrackedVisit } from "../../database/DatabaseSchema";
import { rank } from "../rank";
import { CommandSearchActionResult, groupResults } from "../results";
import { SearchFunction } from "../search";

export const makeTabSearch: (w: TrackedVisit) => SearchFunction =
  (w: TrackedVisit) => async (query: string) => {
    let commands: CommandSearchActionResult[] = [];

    const ranked = rank(query, commands);

    return groupResults(ranked);
  };
