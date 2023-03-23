import Dexie from "dexie";
import { DexieSearchDB, Posting } from "./DexieSearchIndex";
export type TokenCounts = Map<string, number>;

export interface FieldIndexOptions {
  name: string;
  id: string;

  prefix?: boolean;

  /** Optional util to normalize letters -- lowercase, strip accents, etc.
  This function must preserve string indices, and so can only replace single 
  letters with others. */
  normalize?: (x: string) => string;

  /** Split the string into an array of tokens. The same tokenization will
  be applied to the title too. */
  tokenize: (x: string) => string[];

  /** Produce a score, between 0 and 1 given counts from the query and document. */
  score: (
    queryTokens: TokenCounts,
    docMatchingTokens: TokenCounts,
    docTokenLength: number
  ) => number;

  /** Optionally re-rank in more detail, now with the full text of the doc. */
  rank?: (query: any, value: any) => number;
}

export class DexieFieldIndex {
  db: DexieSearchDB;
  options: FieldIndexOptions;
  table: Dexie.Table<Posting, string>;

  constructor(db: DexieSearchDB, options: FieldIndexOptions) {
    this.db = db;
    //@ts-ignore
    this.table = db[options.name];
    this.options = options;
  }

  private getCounts(value: string): [Map<string, number>, number] {
    let length = 0;
    const counts: Map<string, number> = new Map();

    if (this.options.normalize) {
      value = this.options.normalize(value);
    }
    let tokens = this.options.tokenize(value);

    // if (field.postprocess) tokens = tokens.map(this.options.postprocess);

    // Count occurrences of each token
    tokens.forEach((t) => {
      length += 1;

      // Old data or zero for each field
      let prev = counts.get(t);
      counts.set(t, (prev ?? 0) + 1);
    });

    return [counts, length];
  }

  async indexAll(docs: [number, string][]) {
    const counts = docs.map(([id, v]) => [id, this.getCounts(v)[0]] as const);

    const mergedCounts: Map<string, { docs: number[]; counts: number[] }> =
      new Map();

    counts.forEach(([id, docCounts]) => {
      docCounts.forEach((count, token) => {
        let posting = mergedCounts.get(token);

        if (!posting) {
          posting = { docs: [], counts: [] };
          mergedCounts.set(token, posting);
        }

        posting.docs.push(id);
        posting.counts.push(count);
      });
    });

    await this.table.bulkPut(
      //@ts-ignore
      [...mergedCounts.entries()].map(([token, count]) => ({
        x: token,
        [this.options.id]: {
          y: Uint32Array.from(count.docs),
          z: Uint8ClampedArray.from(count.counts),
        },
      }))
    );
  }

  /** Stores a doc */
  async index(id: number, oldValue: string | undefined, newValue: string) {
    if (oldValue === newValue) return;
    const [oldCounts] = this.getCounts(oldValue || "");
    const [newCounts, newLength] = this.getCounts(newValue);
    this.db.metadata.put({
      id,
      [this.options.id]: newValue.length,
    });

    console.log("Indexed ", oldValue?.slice(0, 50), oldCounts, newCounts);

    const additions = [...newCounts.entries()].filter(
      ([token, count]) => oldCounts.get(token) !== count
    );
    const subtractions = [...oldCounts.entries()].filter(
      ([token, count]) => newCounts.get(token) === undefined
    );

    await Promise.all([
      ...additions.map(async ([token, count]) => {
        if (!id) throw new Error("no id");
        const posting = await this.table.get(token);
        const ids = Array.from(posting?.[this.options.id]?.y ?? []);
        const counts = Array.from(posting?.[this.options.id]?.z ?? []);

        const index = ids.indexOf(id);

        if (index === -1) {
          ids.push(id);
          counts.push(count);
        } else {
          ids[index] = id;
          counts[index] = count;
        }

        await this.table.put({
          [this.options.id]: {
            y: Uint32Array.from(ids),
            z: Uint8ClampedArray.from(counts),
          },
          x: token,
        } as Posting);
      }),
      ...subtractions.map(async ([token, oldCount]) => {
        const posting = await this.table.get(token);
        const ids = Array.from(posting?.[this.options.id]?.y ?? []);
        const counts = Array.from(posting?.[this.options.id]?.z ?? []);

        const index = ids.indexOf(id!);

        if (index === -1) {
          console.error(
            "Couldn't find index of doc id in term to delete",
            posting?.x
          );
        } else {
          ids.splice(index, 1);
          counts.splice(index, 1);
        }

        await this.table.put({
          x: token,
          [this.options.id]: {
            y: Uint32Array.from(ids),
            z: Uint8ClampedArray.from(counts),
          },
        } as Posting);
      }),
    ]);
  }

  /** Gets a doc */
  async search(query: string, max?: number) {
    const [queryCounts] = this.getCounts(query);

    const queryTokens = [...queryCounts.keys()];

    console.log(queryTokens);

    let t0 = performance.now();
    const postings = await this.table.bulkGet(queryTokens);

    const docSummaries: Map<number, Map<string, number>> = new Map();

    if (this.options.prefix) {
      const prefixPostings = await this.table
        .where("x")
        .startsWithAnyOf(queryTokens)
        .limit(5)
        .toArray();

      prefixPostings.forEach((p) => {
        p?.[this.options.id]?.y.forEach((y, i) => {
          let counts = docSummaries.get(y);
          if (!counts) {
            counts = new Map();
            docSummaries.set(y, counts);
          }

          const token = queryTokens.find((t) => p.x.startsWith(t))!;
          // Increment by the right amount
          counts.set(
            token,
            (counts.get(token) ?? 0) + p?.[this.options.id].z[i]
          );
        });
      });
    }

    t0 = performance.now();

    postings.filter(Boolean).forEach((p) =>
      p?.[this.options.id]?.y.forEach((y, i) => {
        // If we haven't seen the doc yet, make a new map
        let counts = docSummaries.get(y);
        if (!counts) {
          counts = new Map();
          docSummaries.set(y, counts);
        }

        // Increment by the right amount
        counts.set(p.x, (counts.get(p.x) ?? 0) + p?.[this.options.id].z[i]);
      })
    );

    t0 = performance.now();

    t0 = performance.now();

    const scored = [...docSummaries.entries()]
      .map(([id, summary], i) => ({
        id,
        score: this.options.score(queryCounts, summary, 0),
      }))
      .sort((a, b) => b.score - a.score);

    t0 = performance.now();
    return scored;
  }
}
