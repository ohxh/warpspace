import { currentId } from "async_hooks";
import { TrackedVisit, db } from "../../database/DatabaseSchema";
import { rank } from "../rank";
import { CommandSearchActionResult, PageSearchActionResult, SearchActionResult, WindowSearchActionResult, groupResults } from "../results";
import { SearchFunction, makeSearch } from "../search";
import { makeWindowSearch } from "./makeWindowSearch";
import { currentTabId } from "../../../utils/currentTabId";
import { InfoIcon } from "../../../components/primitives/icons/info";

export const makeSelectionSearch: (selection: PageSearchActionResult[]) => SearchFunction =
  (selection: PageSearchActionResult[]) => async (query: string) => {
    let commands: CommandSearchActionResult[] = [
      {
        title: "Move to...",
        body: "",
        type: "command",
        url: "",
        icon: InfoIcon,
        placeholder: "Search windows...",
        hidePreviewPanel: true,
        children: async (x: string) => {
          const namedWindows = await db.windows.where("title").notEqual("").and(x => x.status === "closed").toArray();
          const openWindows = await db.windows.where("status").equals("open").toArray();

          const options: SearchActionResult[] = [...namedWindows, ...openWindows].map(w => ({
            title: w.title,
            body: "",
            type: "window",
            url: "",
            id: w.id,
            item: w,
            perform: async () => {
              await db
                .transaction("rw", db.tabs, db.windows, async (t) => {
                  const window = await db.windows.get(w.id);
                  if (!window) return

                  if (window.status === "open") {
                    selection.map(t => {
                      const visit = t.visits[0];
                      if (visit.status === "open") {
                        chrome.tabs.move(visit.chromeId, {
                          windowId: window.chromeId,
                          index: 0,
                        })
                        if (visit.chromeId === currentTabId) {
                          chrome.tabs.update(visit.chromeId, {
                            active: true
                          })
                          chrome.tabs.highlight({
                            tabs: [visit.chromeId],
                            windowId: w.chromeId
                          })
                          chrome.windows.update(w.chromeId, {
                            focused: true,
                            drawAttention: true,
                          })
                        }
                      } else {
                        chrome.tabs.create({
                          index: 0,
                          windowId: w.chromeId,
                          active: true,
                          url: visit.url,
                        })
                      }
                    })
                  } else {
                    alert("unimplemented")
                  }
                })
              await Promise.all(selection.map(t => {

              }))

              const res: WindowSearchActionResult = {
                type: "window",
                title: w.title,
                item: w,
                id: w.id,
                body: "",
                url: "",
                children: makeWindowSearch(w)
              }
              return [res]
            }
          }))
          const newWindowResult: CommandSearchActionResult = {
            title: "New window",
            type: "command",
            body: "",
            url: "",
            hidePreviewPanel: true,
            children: (q) => {
              return makeSearch(q, [{
                title: `"${q}"`,
                type: "custom",
                hidePreviewPanel: true,
                body: "",
                url: "",
                perform: async () => {
                  alert("TODO move to new window named " + q)
                }
              }])
            },
            perform: () => {
              alert("TODO move to new window")
            }
          }

          return makeSearch(x, [...options, newWindowResult])
        }
      },
      {
        title: "Copy to...",
        body: "",
        type: "command",
        url: "",
        placeholder: "Search windows...",
      },
      {
        title: "Close",
        body: "",
        type: "command",
        url: "",
        perform: () => {

        }
      }
    ];

    const ranked = rank(query, commands);

    return groupResults(ranked);
  };
