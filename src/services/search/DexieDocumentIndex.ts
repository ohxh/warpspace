import { VolumeOffIcon } from "@heroicons/react/outline";
import Dexie from "dexie";
import { WarpspaceEvent } from "../../utils/WarpspaceEvent";

export type Posting<ShortId extends string> = { [K in ShortId]: number[] } & {
  x: string;
};

export type FullTextEntry<Id extends string> = { [K in Id]: string } & {
  id: number;
};

type GlobalSearchData = {
  id: "global";
  nextDocumentId: number;
};

class SearchDatabase<Fields extends Record<string, string>> extends Dexie {
  postings!: Dexie.Table<Posting<Fields[keyof Fields]>, string>;
  //@ts-ignore
  fullTextEntries!: Dexie.Table<FullTextEntry<keyof Fields>, number>;
  global!: Dexie.Table<GlobalSearchData, string>;

  constructor() {
    super("search");
    this.version(1).stores({
      postings: "x",
      fullTextEntries: "id",
      global: "id",
    });
  }
}

export interface SearchOptions<Fields extends Record<string, string>> {
  fields: { [K in keyof Fields]: FieldOptions<Fields[K]> };
  /** Map the field to token values */
  pipeline: (s: string) => string[];
}

export interface FieldOptions<U extends string> {
  /** Used to compress dexie posting list */
  shortId: U;
}

export class DexieDocumentIndex<Fields extends Record<string, string>> {
  db: SearchDatabase<Fields>;
  onReady: WarpspaceEvent<[]> = new WarpspaceEvent();
  nextDocumentId: number | undefined;
  options: SearchOptions<Fields>;

  constructor(options: SearchOptions<Fields>) {
    this.options = options;
    this.db = new SearchDatabase();
  }

  async init(): Promise<void> {
    const global = await this.db.global.get("global");
    if (global) {
      this.nextDocumentId = global.nextDocumentId;
    } else {
      await this.db.global.add({ id: "global", nextDocumentId: 0 });
      this.nextDocumentId = 0;
    }
  }

  async searchExact(
    token: string,
    fields?: (keyof Fields)[]
  ): Promise<Record<keyof Fields, number[]>> {
    fields = fields ?? Object.keys(this.options.fields);
    const fieldIds: Fields[keyof Fields][] = fields.map(
      (f) => this.options.fields[f].shortId
    );

    const posting = await this.db.postings.get(token);

    //@ts-ignore
    if (!posting) return Object.fromEntries(fields.map((f) => [f, []]));
    // Merge all indicated fields

    //@ts-ignore
    return Object.fromEntries(
      fields.map((f) => [f, posting[this.options.fields[f].shortId]])
    );
  }

  async searchPrefix(
    partialToken: string,
    fields?: (keyof Fields)[]
  ): Promise<Record<keyof Fields, number[]>> {
    fields = fields ?? Object.keys(this.options.fields);

    const postings = await this.db.postings
      .where("x")
      .startsWith(partialToken)
      .toArray();

    console.log("PREFIX", { partialToken, fields, postings });

    //@ts-ignore
    return Object.fromEntries(
      fields.map((f) => [
        f,
        [
          ...new Set([
            ...postings
              .map((posting) => posting[this.options.fields[f].shortId])
              .flat(),
          ]),
        ],
      ])
    );
  }

  async index(document: Record<keyof Fields, string>) {
    let documentId: number;
    await this.db.transaction(
      "rw",
      [this.db.postings, this.db.global, this.db.fullTextEntries],
      async (s) => {
        const global = await this.db.global.get("global");
        documentId = global?.nextDocumentId ?? 0;

        // For each field
        await Promise.all(
          Object.keys(this.options.fields).map((fieldName) => {
            const fieldId = this.options.fields[fieldName].shortId;
            return this.options
              .pipeline(document[fieldName])
              .map(async (token) => {
                // For each token, try to inset
                const posting = await this.db.postings.get(token);
                if (!posting) {
                  return this.db.postings.add({
                    ...this.emptyPosting(token),
                    [fieldId]: [documentId],
                  });
                } else {
                  return this.db.postings.update(posting.x, {
                    [fieldId]: this.unique(...posting[fieldId], documentId),
                  });
                }
              });
          })
        );

        await this.db.fullTextEntries.put({
          id: documentId,
          ...document,
        });

        await this.db.global.put({
          id: "global",
          nextDocumentId: documentId + 1,
        });
      }
    );

    return documentId!;
  }

  async remove(documentId: number) {
    const document = await this.db.fullTextEntries.get(documentId);

    await this.db.transaction(
      "rw",
      [this.db.postings, this.db.fullTextEntries, this.db.global],
      async (s) => {
        // For each field
        await Promise.all(
          Object.keys(this.options.fields).map((fieldName) => {
            const fieldId = this.options.fields[fieldName].shortId;
            return this.options
              .pipeline(document![fieldName])
              .map(async (token) => {
                // For each token, try to inset
                const posting = await this.db.postings.get(token);
                if (!posting) {
                  throw new Error();
                } else {
                  return this.db.postings.update(posting.x, {
                    [fieldId]: posting[fieldId].filter((m) => m !== documentId),
                  });
                }
              });
          })
        );

        await this.db.fullTextEntries.delete(documentId);
      }
    );
  }

  emptyPosting(token: string): Posting<Fields[keyof Fields]> {
    const posting = { x: token };
    Object.values(this.options.fields).map((v) => {
      //@ts-ignore
      posting[v.shortId] = [];
    });
    //@ts-ignore
    return posting;
  }

  unique<T>(...x: T[]) {
    return [...new Set(x)];
  }
}
