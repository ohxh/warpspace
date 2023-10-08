import q from "react-syntax-highlighter/dist/esm/languages/hljs/q";
import { InsertTextIcon } from "../../../components/primitives/icons/insert_text";
import { OpenVisit, Page, TrackedVisit, TrackedWindow, db } from "../../database/DatabaseSchema";
import { index } from "../DexieSearchIndex";
import { rank } from "../rank";
import { CommandSearchActionResult, PageSearchActionResult, WindowSearchActionResult, groupResults } from "../results";
import { SearchFunction, makeSearch } from "../search";
import { normalizeURL } from "../../../utils/normalizeUrl";
import { makePageSearch } from "./makePageSearch";
import { EditIcon } from "../../../components/primitives/icons/edit";
import { CloseIcon } from "../../../components/primitives/icons/close";
import { GroupIcon } from "../../../components/primitives/icons/group";
import { TvIcon } from "@heroicons/react/24/outline";
import { CutIcon } from "../../../components/primitives/icons/cut";
import { MoveGroupIcon } from "../../../components/primitives/icons/move_group";

export const makeWindowCommands: (w: TrackedWindow) => CommandSearchActionResult[] =
  (w) => {
    let commands: CommandSearchActionResult[] = [
      {
        id: "rename-window",
        type: "command",
        title: "Rename...",
        icon: EditIcon,
        body: "",
        url: "",
        placeholder: "Enter new name...",
        hidePreviewPanel: true,
        children: (q) => {
          return makeSearch(q, [{
            title: `"${q}"`,
            type: "custom",
            hidePreviewPanel: true,
            body: "",
            url: "",
            perform: async () => {
              await db.windows.update(w.id, {
                "title": q
              })

              const res: WindowSearchActionResult = {
                type: "window",
                title: q,
                item: w,
                id: w.id,
                body: "",
                url: "",
                children: makeWindowSearch(w)
              }
              return [res]
            }
          }])
        }
      },
      {
        id: "duplicate-window",
        type: "command",
        title: "Duplicate",
        icon: GroupIcon,
        body: "",
        url: "",
        placeholder: "Enter new name...",
        hidePreviewPanel: true,

      },
      {
        id: "duplicate-window",
        type: "command",
        title: "Merge with...",
        icon: MoveGroupIcon,
        body: "",
        url: "",
        placeholder: "Enter new name...",
        hidePreviewPanel: true,

      },
    ];


    // Open / close
    if (w.status === "open") {
      commands.push({
        id: "close-window",
        type: "command",
        title: "Close",
        body: "",
        url: "",
        icon: CloseIcon,
        perform: () => chrome.windows.remove(w.chromeId),
      });
    } else {
      commands.push({
        id: "open-window",
        type: "command",
        title: "Open",
        body: "",
        url: "",
        icon: GroupIcon,
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

    let tabs: TrackedVisit[] = w.status === "open" ?
      await db.tabs.where("windowId").equals(w.id!).and(x => x.status === "open").toArray()
      : await db.tabs.where("windowId").equals(w.id!).and(x => x.status === "closed" && x.closingReason === "window-closed").toArray()

    tabs = tabs.sort((a, b) => (a.status === "open" ? a.position.index : 0) - (b.status === "open" ? b.position.index : 0))

    const openPages = await db.pages.bulkGet(tabs.map(x => normalizeURL(x.url)))

    const visits: PageSearchActionResult[] = await Promise.all(openPages.map(async (t, i) => {
      const res: PageSearchActionResult = {
        type: "page",
        item: t!,
        title: t!.metadata.title || "",
        body: (await index.get(t!.searchId))?.body || "",
        url: t!.url,
        id: t!.url,
        debug: {
          score: 999,
          threshold: 0,
          finalScore: 9999,
        },
        perform: async () => {

          await db.transaction("r", db.tabs, db.windows, async (tr) => {
            const window = await db.windows.get(w.id);

            if (window?.status === "open") {

              chrome.windows.update(window.chromeId, {
                focused: true,
                state: "fullscreen",
              })
              chrome.tabs.update((tabs[0] as OpenVisit).chromeId, {
                active: true,
              })
            } else {
              // revive window
            }
          })
          return
        },
        visits: [tabs[i]],
        children: makePageSearch(t!),
      }
      return res;
    }));

    const ranked = rank(query, [...visits, ...commands,])

    return groupResults(ranked);
  };
