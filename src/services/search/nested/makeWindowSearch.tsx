import { InsertTextIcon } from "../../../components/primitives/icons/insert_text";
import { TrackedWindow, db } from "../../database/DatabaseSchema";
import { index } from "../DexieSearchIndex";
import { rank } from "../rank";
import { CommandSearchActionResult, groupResults } from "../results";
import { SearchFunction } from "../search";

export const makeWindowCommands: (w: TrackedWindow) => CommandSearchActionResult[] =
  (w) => {
    let commands: CommandSearchActionResult[] = [
      {
        id: "rename-window",
        type: "command",
        title: "Rename window",
        icon: InsertTextIcon,
        body: "",
        url: "",
        placeholder: "Enter new name...",
        hidePreviewPanel: true,
        children: async (query) =>
          rank(query, query.trim() ? [{
            id: "hi",
            title: '"' + query.trim() + '"',
            body: "",
            url: "",
            score: 100,
            type: "custom" as const,
            perform: async () => {
              await db.windows.update(w.id, {
                title: query.trim(),
              })
              await index.index(w.searchId, {
                title: query.trim(),
                url: "",
                body: "",
                type: "window",
              })

            },
          }] : []),
      },
    ];

    // Open / close
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


    return commands;
  }

export const makeWindowSearch: (w: TrackedWindow) => SearchFunction =
  (w: TrackedWindow) => async (query: string) => {
    let commands = makeWindowCommands(w)
    commands.push({
      id: "rename-window",
      type: "command",
      title: "Rename window",
      body: "",
      url: "",
      placeholder: "Enter new name...",
      hidePreviewPanel: true,
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
