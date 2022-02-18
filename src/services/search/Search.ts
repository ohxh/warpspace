import { ActiveVisit, db, Page } from "../Database";
import { isStopWord } from "./StopWordFilter";
import { tokenizer } from "./Tokenizer";
import { porterStemmer } from "./PorterStemmer";
import { TabStore } from "../TabStore";
import { parse } from "url";
import { DexieDocumentIndex } from "./DexieDocumentIndex";

export class SearchService {
  store: TabStore;
  index: DexieDocumentIndex<{
    body: "b";
    url: "u";
    title: "t";
  }>;

  constructor(store: TabStore) {
    this.index = new DexieDocumentIndex({
      fields: {
        body: {
          shortId: "b",
        },
        url: {
          shortId: "u",
        },
        title: {
          shortId: "t",
        },
      },
      pipeline: (text) =>
        tokenizer(text.toLowerCase()).map((x) => porterStemmer(x)),
    });
    this.store = store;
  }

  async processSearch(search: string) {
    const query = parseQuery(search);

    const individualTokenResults = await Promise.all([
      ...query.tokens.map((t) => this.index.searchExact(t)),
      ...query.prefixTokens.map((t) => this.index.searchPrefix(t)),
    ]);

    const preliminaryScores: Record<number, number> = {};

    individualTokenResults.map((i) => {
      i.body.map((b) => (preliminaryScores[b] += 1));
      i.url.map((b) => (preliminaryScores[b] += 2));
      i.title.map((b) => (preliminaryScores[b] += 5));
    });

    const finalCandidates = Object.entries(preliminaryScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1000)
      .map((x) => parseInt(x[0]));

    // Get from tabStore

    const visits = await db.visits
      .where("searchId")
      .anyOf(finalCandidates)
      .toArray();
    const pages = await db.pages
      .where("searchId")
      .anyOf(finalCandidates)
      .toArray();

    console.log({
      query,
      individualTokenResults,
      preliminaryScores,
      finalCandidates,
      visits,
      pages,
    });

    const uniqueVisits = [...visits].filter(Boolean);

    const uniquePages = [...pages]
      .filter(Boolean)
      .filter((p) => !visits.some((v) => v.url === p.url));

    return [...uniquePages, ...uniqueVisits];
  }

  async indexDocument(x: any) {
    console.log("Indexing " + x.title);
    return this.index.index(x);
  }

  async removeDocument(id: number) {
    console.log("Removing index " + id);
    return this.index.remove(id);
  }
}

export interface SearchQuery {
  text: string;
  cursorPosition: number;

  filters: [];
}

export interface SearchResults {
  // If the query ended in a partial token, the most likely completion of it
  mostLikelyCompletion?: string;

  results: SearchMatch[];
}

export type SearchMatch = {
  resource: ActiveVisit | Page;
  preview: string;
};

function search(query: string) {
  // Process query into filters, text
  // Tokenize query text into prefix / non-prefix tokens
  // Search for each token
  // Merge matches
  // pre-score, cutoff if needed
  // grab docs
  // Make previews + re-score
  // Sort
  // Return
}

export function parseQuery(query: string) {
  const t0 = performance.now();
  const baseTokens = query.split(/\s/g);

  const tokens: string[] = [];
  const prefixTokens: string[] = [];

  let url: string | undefined;
  let fields: string[] | undefined;
  let dateStart: Date | undefined;
  let dateEnd: Date | undefined;
  let bookmarked: boolean | undefined;
  let open: boolean | undefined;
  let saved: boolean | undefined;

  baseTokens.filter(Boolean).forEach((t, i) => {
    if (
      t.startsWith("site:") ||
      t.startsWith("website:") ||
      t.startsWith("url:")
    ) {
      url = t.slice(t.indexOf(":") + 1);
    } else if (t.startsWith("in:")) {
      fields = t.slice(t.indexOf(":") + 1).split(",");
    } else if (t.startsWith("is:bookmark")) {
      fields = t.slice(t.indexOf(":") + 1).split(",");
    }
    // Time clauses
    else if (t.startsWith("this:")) {
      t.slice(t.indexOf(":") + 1);
    } else if (t.startsWith("last:")) {
      t.slice(t.indexOf(":") + 1);
    } else if (t.startsWith("before:")) {
      t.slice(t.indexOf(":") + 1);
    } else if (t.startsWith("since:")) {
      t.slice(t.indexOf(":") + 1);
    } else if (t === "is:bookmarked") {
      bookmarked = true;
    } else if (t === "is:saved") {
      saved = true;
    } else if (t === "is:open") {
      open = true;
    } else if (t === "is:closed") {
      open = false;
    } else {
      if (i === baseTokens.length - 1) {
        let x = processString(t);
        tokens.push(...x.slice(0, -1));
        prefixTokens.push(...x.slice(-1));
        prefixTokens.push(t);
      } else tokens.push(...processString(t));
    }
  });

  return {
    tokens,
    prefixTokens,
    url,
    fields,
    dateStart,
    dateEnd,
    bookmarked,
    open,
    saved,
  };
}

function processString(document: string) {
  const tokens = tokenizer(document);
  const filtered = tokens.filter((t) => t && t.length > 1 && !isStopWord(t));
  const stems = filtered.map((t) => porterStemmer(t));
  return stems;
}
