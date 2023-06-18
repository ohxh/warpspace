import { db, OpenVisit } from "../database/DatabaseSchema";
import { Timer } from "../logging/log";
import { getLiveSettings } from "../settings/WarpspaceSettingsContext";
import { index } from "./DexieSearchIndex";
import { makePageSearch } from "./nested/makePageSearch";
import { makeTabCommands } from "./nested/makeTabSearch";
import { makeWindowCommands } from "./nested/makeWindowSearch";
import { rootCommands } from "./nested/rootCommands";
import { makeFuzzyRegex, rank } from "./rank";
import {
  groupResults,
  BaseSearchActionResult,
  SearchActionResult,
} from "./results";
import { normalize } from "./utils/normalize";
import { tokenize } from "./utils/tokenize";

export type SearchFunction = (
  query: string,
  additionalHighlightQuery?: string,
  maxCount?: number,
) => Promise<(string | BaseSearchActionResult)[]>;


/** Root level search function. */
export const search: SearchFunction = async (query: string, additionalHighlightQuery: string | undefined) => {
  const t = new Timer()

  const activeChromeTab = await chrome.tabs.getCurrent();
  const activeChromeWindow = await chrome.windows.getCurrent();

  const activeTab = await db.tabs.where("chromeId").equals(activeChromeTab.id!).first();
  const activeWindow = await db.windows.where("chromeId").equals(activeChromeWindow.id!).first();

  if (!activeTab) throw new Error("No active tab")
  if (!activeWindow) throw new Error("No active window")

  let commands = [...rootCommands, ...makeWindowCommands(activeWindow), ...makeTabCommands(activeTab)];

  if (query.trim() === "") {
    const openWindows = await db.windows.where("status").equals("open").toArray();
    const openVisits = await db.tabs.where("status").equals("open").toArray();

    const windows = openWindows.map(w => {
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
      }
      return res;
    });

    const visits: BaseSearchActionResult[] = openVisits.map(v => {
      const res: SearchActionResult = {
        type: "visit",
        title: v.metadata.title || "",
        body: "",
        url: v.url || "",
        debug: {
          score: 999,
          threshold: 0,
          finalScore: 9999,
        },

        item: v,
      }
      return res
    })

    return ["window", ...windows, "page", ...visits];
  }

  // if (query.startsWith(lastSearch) && lastSearch.length > 4 && lastCommands.length < 10 && false) {

  //   console.log("Using root cache")
  //   const grouped = await makeSearch(query, [...lastCommands], additionalHighlightQuery)

  //   lastSearch = query;
  //   //@ts-ignore
  //   lastCommands = grouped.filter(x => typeof x !== "string" && !x.isInline) as any as WarpspaceCommand[]

  //   return grouped;
  // } else {
  //   console.log("Not using root cache")


  const items = await index.getCandidates(query);
  console.log("Candidates for  " + query, items)

  t.mark("Get candidates (" + items.length + ")")

  let visitified: any;

  await db.transaction("r", db.pages, db.tabs, async t => {

    // TODO filter here
    visitified = await Promise.all(
      items.map(async (i) => {
        const [page] = await db.pages.where("searchId").equals(i.id).toArray();

        if (!page) {
          console.error("Couldn't fid page with searchid", i)
          return [];
        }

        const openVisits = await db.tabs.where("[url+status]").equals([page.url, "open"]).toArray() as OpenVisit[];

        console.log("QQQLLL No hits?", { openVisits, query: [page.url, "open"] })
        if (openVisits.length > 0) {
          return openVisits.map(v => ({
            ...i,
            item: v,
            type: "visit" as const,
            page,
          }))
        } else return {
          ...i,
          type: page.url.startsWith("file") ? "file" as const : "page" as const,
          item: page,
          page,
        }
      })
    );

  })

  t.mark("Visitify")

  const splitDocs = visitified.flat()

  t.mark("Split")

  const commandified: SearchActionResult[] = splitDocs.map((i: any) => {
    //@ts-ignore
    if (i.type === "page") {
      return {
        //@ts-ignore
        ...i,

        perform: async () => {
          //@ts-ignore
          await chrome.tabs.create({ url: i.item.url });
        },
        //@ts-ignore
        children: i.body.trim() ? makePageSearch(i.item) : undefined,
      };
    } else if (i.type === "visit" || i.type === "file") {
      return {
        ...i,
        boost: 1 + (1 - 4 / ((i.page.ranking.typedCount || 0) + 4)) * 0.25,

        perform: async () => {
          if (i.item.type === "visit")
            await chrome.tabs.update(i.item.chromeId, { active: true });
          else await chrome.tabs.create({ url: i.item.url });
        },
        children: i.body.trim() ? makePageSearch(i.page) : undefined//makeTabSearch(i.item),
      };
    }
    // else if (i.type === "window") {
    //   return {
    //     ...i,
    //     perform: async () => { },
    //     children: makeWindowSearch(i.item),
    //   };
    // } 
    throw new Error();
  });
  t.mark("Commandify")

  const grouped = await makeSearch(query, [...commandified, ...commands], additionalHighlightQuery)
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

  //   <img src="https://cdn.osxdaily.com/wp-content/uploads/2021/06/macos-monterey-12-Light-copy.jpeg" style="
  //     width: 100%;
  // ">

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






