import { InsertTextIcon } from "../../../components/primitives/icons/insert_text";
import { SettingsIcon } from "../../../components/primitives/icons/settings";
import { TextFieldsIcon } from "../../../components/primitives/icons/text_fields";
import { rank } from "../rank";
import { CommandSearchActionResult } from "../results";


export const rootCommands: CommandSearchActionResult[] = [
  // {
  //   id: "new-tab",
  //   title: "New Tab",
  //   url: "",
  //   body: "",
  //   type: "command",
  //   perform: async () => {
  //     await chrome.tabs.create({});
  //   },
  // },

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
  // {
  //   id: "new-note",
  //   title: "New Note",
  //   url: "",
  //   body: "",
  //   type: "command",
  //   perform: async () => {
  //     await chrome.tabs.create({
  //       url: `https://warpspace.app/note/${Date.now()}`,
  //     });
  //   },
  //   placeholder: "Enter name...",
  //   children: async (query) =>
  //     rank(query, [{
  //       id: "hi",
  //       title: `New note: "${query}"`,
  //       body: "",
  //       url: "",
  //       score: 100,
  //       type: "custom" as const,
  //       perform: async () => alert(query),
  //     }]),

  // },
  // {
  //   id: "new-window",
  //   title: "New Window",
  //   url: "",
  //   body: "",
  //   type: "command",
  //   perform: async () => {
  //     await chrome.windows.create({});
  //   },
  //   placeholder: "Enter name...",
  //   children: async (query) =>
  //     rank(query, [{
  //       id: "hi",
  //       title: `New window: "${query}"`,
  //       body: "",
  //       url: "",
  //       score: 100,
  //       type: "custom" as const,
  //       perform: async () => alert(query),
  //     }]),

  // },
];
