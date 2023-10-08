import { InsertTextIcon } from "../../../components/primitives/icons/insert_text";
import { TrackedVisit, db } from "../../database/DatabaseSchema";
import { index } from "../DexieSearchIndex";
import { rank } from "../rank";
import { CommandSearchActionResult, groupResults } from "../results";
import { SearchFunction } from "../search";

export const makePageCommands: (
  w: TrackedVisit
) => CommandSearchActionResult[] = (w) => {
  let commands: CommandSearchActionResult[] = [
    {
      id: "rename-window",
      type: "command",
      title: "Rename tab",
      icon: InsertTextIcon,
      body: "",
      url: "",
      placeholder: "Enter new name...",
      hidePreviewPanel: true,
      children: async (query) => rank(query, query.trim() ? [] : []),
    },
  ];

  // Open / close
  if (w.status === "open") {
    commands.push({
      id: "close-window",
      type: "command",
      title: "Close tab",
      body: "",
      url: "",
      perform: () => chrome.windows.remove(w.chromeId),
    });
  } else {
    commands.push({
      id: "open-window",
      type: "command",
      title: "Open tab",
      body: "",
      url: "",
      perform: () => {
        throw new Error("Unimplemented");
      },
    });
  }

  return commands;
};

export const makeTabSearch: (w: TrackedVisit) => SearchFunction =
  (w: TrackedVisit) => async (query: string) => {
    let commands: CommandSearchActionResult[] = [];

    const ranked = rank(query, commands);

    return groupResults(ranked);
  };
