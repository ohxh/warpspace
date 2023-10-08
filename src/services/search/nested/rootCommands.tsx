import { NewWindowIcon } from "../../../components/primitives/Favicon";
import { GroupIcon } from "../../../components/primitives/icons/group";
import { InsertTextIcon } from "../../../components/primitives/icons/insert_text";
import { SettingsIcon } from "../../../components/primitives/icons/settings";
import { TextFieldsIcon } from "../../../components/primitives/icons/text_fields";
import { db } from "../../database/DatabaseSchema";
import { rank } from "../rank";
import { CommandSearchActionResult, SearchActionResult } from "../results";
import { makeWindowSearch } from "./makeWindowSearch";


export const rootCommands: CommandSearchActionResult[] = [
  {
    id: "new-tab",
    title: "New Tab",
    url: "",
    body: "",
    type: "command",
    perform: async () => {
      await chrome.tabs.create({});
    },
  },

  {
    id: "settings",

    title: "Settings",
    url: "",
    body: "",
    icon: SettingsIcon,
    type: "command",
    children: async () => {
      return [];
    },
  },
  {
    id: "new-window",
    title: "New Window",
    url: "",
    body: "",
    type: "command",
    perform: async () => {
      await chrome.windows.create({});
    },
    placeholder: "Enter name...",
    children: async (query) =>
      rank(query, [{
        id: "hi",
        title: `New window: "${query}"`,
        body: "",
        url: "",
        score: 100,
        type: "custom" as const,
        perform: async () => {

          const w = await chrome.windows.create({
            focused: false,
            state: "minimized",
          });
          await new Promise(r => {
            setTimeout(r, 100)
          })
          const dbw = await db.windows.where("chromeId").equals(w.id!).first()
          if (!dbw) {
            alert("New window not found")
            return
          }
          await db.windows.update(dbw!.id!, { title: query })

          const res: SearchActionResult = {
            type: "window",
            item: dbw,
            title: query,
            body: "",
            url: "",
            debug: {
              score: 999,
              threshold: 0,
              finalScore: 9999,
            },
            children: makeWindowSearch(dbw),
          }

          return [res]
        },
      }]),
    icon: GroupIcon,
  },
];
