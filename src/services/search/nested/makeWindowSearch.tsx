import { TrackedWindow } from "../../database/DatabaseSchema";
import { rank } from "../rank";
import { SearchActionResult, SearchCandidate, groupResults } from "../results";
import { SearchFunction } from "../search";

export const makeWindowSearch: (w: TrackedWindow) => SearchFunction =
  (w: TrackedWindow) => async (query: string) => {
    let commands: SearchActionResult[] = [];
    if (w.status === "open") {
      commands.push({
        id: "close-window",
        type: "command",
        title: "Close window",
        body: "",
        url: "",
        perform: () => chrome.windows.remove(w.chromeId),
      });
    } else {
      commands.push({
        id: "open-window",
        type: "command",
        title: "Open window",
        body: "",
        url: "",
        perform: () => {
          throw new Error("Unimplemented");
        },
      });
    }

    commands.push({
      id: "rename-window",
      type: "command",
      title: "Rename window",
      body: "",
      url: "",
      placeholder: "Enter new name...",
      children: async (query) =>
        rank(query, [{
          id: "hi",

          title: query,
          body: "",
          url: "",
          score: 100,
          type: "custom" as const,
          perform: async () => alert(query),
        }]),

    });


    const ranked = rank(query, commands)


    return groupResults(ranked);
  };
