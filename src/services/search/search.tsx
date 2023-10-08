import { map } from "lodash";
import { currentTabId } from "../../utils/currentTabId";
import { normalizeURL } from "../../utils/normalizeUrl";
import { openSavedWindow } from "../actions/openSavedWindow";
import { db, OpenVisit } from "../database/DatabaseSchema";
import { Timer } from "../logging/log";
import { getLiveSettings } from "../settings/WarpspaceSettingsContext";
import { index } from "./DexieSearchIndex";
import { makePageSearch } from "./nested/makePageSearch";
import { makePageCommands, makeTabSearch } from "./nested/makeTabSearch";
import { makeWindowCommands, makeWindowSearch } from "./nested/makeWindowSearch";
import { rootCommands } from "./nested/rootCommands";
import { makeFuzzyRegex, rank } from "./rank";
import {
  groupResults,
  BaseSearchActionResult,
  SearchActionResult,
  PageSearchActionResult,
  WindowSearchActionResult,
} from "./results";
import { normalize } from "./utils/normalize";
import { tokenize } from "./utils/tokenize";

export type SearchFunction = (
  query: string,
  additionalHighlightQuery?: string,
  maxCount?: number,
) => Promise<(string | SearchActionResult)[]>;


/** Root level search function. */
export const rootSearch: SearchFunction = async (query: string, additionalHighlightQuery: string | undefined) => {
  const t = new Timer()

  const activeChromeTab = await chrome.tabs.getCurrent();
  const activeChromeWindow = await chrome.windows.getCurrent();

  const activeTab = await db.tabs.where("chromeId").equals(activeChromeTab.id!).first();
  const activeWindow = await db.windows.where("chromeId").equals(activeChromeWindow.id!).first();

  if (!activeTab) throw new Error("No active tab")
  if (!activeWindow) throw new Error("No active window")

  let commands = [...rootCommands];

  if (query.trim() === "") {
    const openWindows = await db.windows.where("status").equals("open").toArray();
    const openVisits = (await db.tabs.where("status").equals("open").toArray() as OpenVisit[]);
    const openPages = await db.pages.bulkGet(openVisits.map(x => normalizeURL(x.url)))

    const currentWindowId = openVisits.find(v => v.chromeId === currentTabId)?.windowId
    const windows = openWindows.
      sort((a, b) => {
        if (a.id === currentWindowId) return -1
        else if (b.id === currentWindowId) return 1
        else if (a.title) return -1
        else if (b.title) return 1
        else return 0

      }).
      map(w => {
        const res: SearchActionResult = {
          type: "window",
          item: w,
          title: w.title || "",
          body: "",
          url: "",
          debug: {
            score: 999,
            threshold: 0,
            finalScore: 9999,
          },
          /** @ts-ignore */
          ntabs: openVisits.filter(t => t.windowId === w.id).length,
          children: makeWindowSearch(w),
        }
        return res;
      });

    let visits: PageSearchActionResult[] = await Promise.all(openPages.map(async t => {
      const res: SearchActionResult = {
        type: "page",
        item: t!,
        title: t!.metadata.title || "",
        id: t?.url,
        body: (await index.get(t!.searchId))?.body || "",
        url: t!.url,
        debug: {
          score: 999,
          threshold: 0,
          finalScore: 9999,
        },
        visits: (await db.tabs.where("url").equals(t!.url).toArray()).sort((a, b) => {
          // Active -> most recently opened -> most recently closed
          if (a.status === "open" && a.chromeId === currentTabId) return -1
          else if (b.status === "open" && b.chromeId === currentTabId) return 1
          else if (b.status === "open" && a.status === "open") return b.openedAt.getTime() - a.openedAt.getTime()
          else if (a.status === "open") return -1
          else if (b.status === "open") return 1
          else return b.closedAt.getTime() - a.closedAt.getTime()
        }),
        children: makePageSearch(t!),
      }
      return res;
    }));


    visits = visits.sort((a, b) => {
      // Active -> most recently opened -> most recently closed
      if (a.visits[0].status === "open" && a.visits[0].chromeId === currentTabId) return -1
      else if (b.visits[0].status === "open" && b.visits[0].chromeId === currentTabId) return 1
      else if (b.visits[0].status === "open" && a.visits[0].status === "open") return b.visits[0].openedAt.getTime() - a.visits[0].openedAt.getTime()
      else if (a.visits[0].status === "open") return -1
      else if (b.visits[0].status === "open") return 1
      else return b.visits[0].closedAt.getTime() - a.visits[0].closedAt.getTime()
    })

    return ["window", ...windows, "page", ...visits];
  }

  const items = await index.getCandidates(query);
  console.log("Candidates for  " + query, items)

  t.mark("Get candidates (" + items.length + ")")


  let enriched: PageSearchActionResult[] = []

  await db.transaction("r", db.pages, db.tabs, async t => {
    enriched = await Promise.all(
      items.map(async (i) => {
        const [page] = await db.pages.where("searchId").equals(i.id).toArray();

        if (!page) {
          console.error("Couldn't fid page with searchid", i)
          throw new Error("no page");
        }

        const visits = await db.tabs.where("url").equals(page.url).toArray() as OpenVisit[];

        const result: PageSearchActionResult = {
          ...i,
          item: page,
          type: "page",
          visits: visits
        }
        return result
      })
    );

  })

  t.mark("Visitify")


  t.mark("Split")

  const commandified: SearchActionResult[] = enriched.map((i) => ({
    ...i,

    perform: async () => {
      //@ts-ignore
      await chrome.tabs.create({ url: i.item.url });
    },
    //@ts-ignore
    children: i.body.trim() ? makePageSearch(i.item) : undefined,
  }));

  t.mark("Commandify")

  const windows = (await db.windows.where("title").notEqual("").toArray())
  const windowCommands: WindowSearchActionResult[] = windows.map(w => ({
    type: "window",
    item: w,
    title: w.title,
    body: "",
    url: "",
    perform: () => openSavedWindow(w.id),
    children: makeWindowSearch(w)
  }))

  const grouped = await makeSearch(query, [...commandified, ...commands, ...windowCommands], additionalHighlightQuery)
  //@ts-ignore
  // lastSearch = query;
  //@ts-ignore
  // lastCommands = grouped.filter(x => typeof x !== "string" && !x.isInline) as any as WarpspaceCommand[]
  t.mark("Group")

  t.finish();

  t.print()
  return grouped;
}
// };


export async function makeSearch(query: string, options: SearchActionResult[], additionalHighlightQuery?: string) {

  const settings = await getLiveSettings();

  let scored = rank(query, options, settings.developer.showHiddenResults, additionalHighlightQuery)

  // HEURISTIC: Trim sites that appear as duplicated (differ only in query/hash)
  // Take first site with given title + origin

  const seenCombos: Set<string> = new Set()

  scored = scored.filter((s) => {
    if (!s.url?.trim()) return true;
    const withoutParams = new URL(s.url);
    withoutParams.search = "";
    withoutParams.hash = "";
    withoutParams.pathname = "/"

    const id = withoutParams.href + "|" + s.title;


    if (seenCombos.has(id)) {
      if (settings.developer.showHiddenResults) s.debug.duplicate = true;
      else return false;
    }
    seenCombos.add(id)
    return true
  })

  //@ts-ignore
  const nodups = scored.filter(s => !s.debug.duplicate)

  const hasChildren = nodups.filter(s => !!s.children);


  // results where not all terms are satisfied by title and url
  // OR top result...?
  const scored2 = hasChildren.filter((s, i) => {
    if (query.trim().length == 1) return false;
    const subquery = tokenize(normalize(query))
      .filter((x) => {
        const regex = new RegExp(makeFuzzyRegex(x), "gim");
        if (regex.test(normalize(s.title)))
          return false;
        regex.lastIndex = 0;
        if (regex.test(normalize(s.url)))
          return false;
        regex.lastIndex = 0;
        return true
      })
      .join(" ")
      .trim();

    return !!subquery || i === 0;
  })


  await Promise.all(scored2.slice(0, 3).map(async s => {

    const subquery = tokenize(normalize(query))
      .filter((x) => {
        const regex = new RegExp(makeFuzzyRegex(x), "gim");
        if (regex.test(normalize(s.title)))
          return false;
        regex.lastIndex = 0;
        if (regex.test(normalize(s.url)))
          return false;
        regex.lastIndex = 0;
        return true
      })
      .join(" ")
      .trim();

    const mask = tokenize(normalize(query))
      .filter((x) => {
        const regex = new RegExp(makeFuzzyRegex(x), "gim");
        if (regex.test(normalize(s.title)))
          return true;
        regex.lastIndex = 0;
        if (regex.test(normalize(s.url)))
          return true;
        regex.lastIndex = 0;
        return false
      })
      .join(" ")
      .trim();


    if (s.children) {
      s.debug.subquery = mask;
      const nested = await s.children(query, mask);

      const filtered = nested.filter(
        (x: any) => typeof x !== "string"
      ) as BaseSearchActionResult[];

      let maxNested: number;
      if (scored.length == 1) {
        maxNested = 20;
      } else {
        maxNested = 3
      }

      if (filtered[0]) {
        const bestNestedScore = (filtered[0].debug.finalScore / filtered[0].debug.threshold * s.debug.threshold)
        if (bestNestedScore > s.debug.finalScore * 1.2 || query.trim() != mask) {
          //@ts-ignore
          s.inline = filtered.map(f => ({ ...f, isInline: (f.isInline ?? 0) + 1 })).slice(0, maxNested);
          // s.debug.finalScore = Math.max(s.debug.finalScore, bestNestedScore)
        }
      }
    } else {
    }
  }))

  scored = scored.sort((a, b) => b.debug.finalScore - a.debug.finalScore).filter((x) => x.debug.finalScore >= (settings.developer.showHiddenResults ? -Infinity : x.debug.threshold));

  console.log("groupResults, ", scored)
  const grouped = groupResults(scored);

  return grouped;
}







