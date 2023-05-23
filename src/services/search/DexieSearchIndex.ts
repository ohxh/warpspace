import Dexie from "dexie";
import { Timer } from "../logging/log";
import { DexieFieldIndex } from "./DexieFieldIndex";
import { SearchCandidate } from "./results";
import { fullTextScore } from "./utils/fullTextScore";
import { normalize } from "./utils/normalize";
import { pseudoSorensonDiceScore, trigrams } from "./utils/sorensonDice";
import { separator, tokenize } from "./utils/tokenize";

export interface SearchDoc {
  title: string;
  url: string;
  body: string;
  type: "page" | "note" | "window";
  id: number;
}

export type Metadata = Omit<
  {
    [x in string]: any;
  },
  "id"
> & {
  id: number;
};

/** Posting in the inverted index. */
export type Posting = Omit<
  {
    [key: string]: {
      y: Uint32Array;
      z: Uint8ClampedArray;
    };
  },
  "x"
> & {
  // The actual token represented by this posting.
  x: string;
};

export class DexieSearchDB extends Dexie {
  docs!: Dexie.Table<SearchDoc, number>;
  title!: Dexie.Table<Posting, string>;
  body!: Dexie.Table<Posting, string>;
  url!: Dexie.Table<Posting, string>;
  metadata!: Dexie.Table<Metadata, number>;

  constructor(name: string, version: number) {
    super(name);
    this.version(version).stores({
      docs: "&id",
      title: "&x",
      url: "&x",
      body: "&x",
      metadata: "++id",
    });
  }
}

export interface ItemSearchMetadata {
  id?: number;
  url: string;
  type: "page" | "note" | "window";
}

export interface ItemSearchOptions {
  titleWeight: number;
  bodyWeight: number;
  urlWeight: number;

  candidateCount: number;
  finalCount: number;
  finalCountPerType: number;
}

export class DexieSearchIndex {
  db: DexieSearchDB;

  titles: DexieFieldIndex;
  urls: DexieFieldIndex;
  bodies: DexieFieldIndex;

  options: ItemSearchOptions;

  constructor(name: string, version: number, options: ItemSearchOptions) {
    this.db = new DexieSearchDB(name, version);
    this.titles = new DexieFieldIndex(this.db, {
      name: "title",
      id: "t",
      tokenize: (x) => [
        ...trigrams(x.replaceAll(separator, " ")),
        ...trigrams(x.replaceAll(separator, "")),
      ],
      score: pseudoSorensonDiceScore,
      normalize: normalize,
    });
    this.urls = new DexieFieldIndex(this.db, {
      name: "url",
      id: "u",
      tokenize: (x) => trigrams(x.replaceAll(separator, "")),
      score: pseudoSorensonDiceScore,
      normalize: normalize,
    });
    this.bodies = new DexieFieldIndex(this.db, {
      name: "body",
      id: "b",
      prefix: true,
      tokenize: tokenize,
      score: fullTextScore,
      normalize: normalize,
    });
    this.options = options;
  }

  async get(id: number) {
    return this.db.docs.get(id);
  }

  /** Index a doc
   * Leaves any fields that are left undefined unchanges.
   */
  async index(
    id: number,
    doc: {
      title?: string;
      url?: string;
      body?: string;
      type?: "page" | "window" | "note";
    }
  ) {
    const t = performance.now();

    console.log("Index " + id + ": " + Object.keys(doc).join(", "));

    await this.db.transaction(
      "rw",
      this.db.title,
      this.db.body,
      this.db.url,
      this.db.metadata,
      this.db.docs,
      async () => {
        const oldDocRaw = await this.db.docs.get(id);

        const oldDoc = {
          title: "",
          body: "",
          url: "",
          ...oldDocRaw,
        };

        const newDoc = {
          type: "page" as const,
          ...oldDoc,
          ...doc,
          id,
        };
        await this.db.docs.put(newDoc);

        await Promise.all([
          doc.body !== undefined
            ? this.bodies.index(id, oldDoc.body, newDoc.body)
            : undefined,
          doc.title !== undefined
            ? this.titles.index(id, oldDoc.title, newDoc.title)
            : undefined,
          doc.url !== undefined
            ? this.urls.index(id, oldDoc.url, newDoc.url)
            : undefined,
        ]);
      }
    );

    // console.log(
    //   "Finished indexing" + " in " + (performance.now() - t) + "ms",
    //   doc
    // );
    return;
  }

  async indexAll(
    docs: {
      id: number;
      title: string;
      url: string;
      body: string;
      type: "page" | "window" | "note";
    }[]
  ) {
    const t = performance.now();

    await this.db.transaction(
      "rw",
      this.db.title,
      this.db.body,
      this.db.url,
      this.db.metadata,
      this.db.docs,
      async () => {
        await Promise.all([
          this.db.docs.bulkPut(docs),
          this.titles.indexAll(docs.map((d) => [d.id, d.title])),
          this.bodies.indexAll(docs.map((d) => [d.id, d.body])),
          this.urls.indexAll(docs.map((d) => [d.id, d.url])),
        ]);
      }
    );

    // console.log(
    //   "Finished indexing" +
    //     docs.length +
    //     " in " +
    //     (performance.now() - t) +
    //     "ms"
    // );
    return;
  }

  async getCandidates(
    query: string,
    constraints?: {
      type?: ("page" | "window" | "note")[];
    }
  ): Promise<SearchCandidate[]> {
    // todo:

    // search for each term
    // take highest term score
    // merge back together
    let t = new Timer();
    const [titleHits, urlHits, bodyHits] = await Promise.all([
      this.titles.search(query, this.options.candidateCount),
      this.urls.search(query, this.options.candidateCount),
      this.bodies.search(query, this.options.candidateCount),
    ]);

    t.mark("Searches");

    const merged = new Map<number, number>();

    titleHits.forEach((h) => {
      merged.set(h.id, (merged.get(h.id) ?? 0) + h.score);
    });

    bodyHits.forEach((h) => {
      merged.set(h.id, (merged.get(h.id) ?? 0) + h.score);
    });

    urlHits.forEach((h) => {
      merged.set(h.id, (merged.get(h.id) ?? 0) + h.score);
    });

    console.log("candidates hits", { titleHits, bodyHits, urlHits });
    const collated = [...merged.entries()]
      .filter(([x, score]) => score > 0)
      .sort(([idA, scoreA], [idB, scoreB]) => scoreB - scoreA)
      .map(([id, score]) => ({ id, score }))
      .slice(0, this.options.candidateCount);

    t.mark("Collate");

    const docs = await this.db.docs.bulkGet(collated.map((x) => x.id));

    const final = docs.map((doc, i) => {
      const score = collated[i];

      if (!doc) {
        console.error("Couldn't find doc", score.id);
        return;
      }
      return {
        ...doc,
        score: score.score,
      };
    });

    t.mark("Final");
    t.finish();
    t.print();
    const truthy = Boolean as any as <T>(
      x: T | false | undefined | null | "" | 0
    ) => x is T;

    return final.filter(truthy);
  }
}

export const index = new DexieSearchIndex("WarpspaceSearch", 1, {
  bodyWeight: 1,
  titleWeight: 1,
  urlWeight: 1,
  candidateCount: 100,
  finalCount: 12,
  finalCountPerType: 3,
});
