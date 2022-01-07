import { Index, Document, Worker } from "flexsearch";
import FlexSearch from "flexsearch";

export type ActiveTab = {
  id: string;
  title: string;
  url: string;
  content: string;
};

function preTokenizeUrl(url: string) {
  // Split by punctuation and camecase
  return url.replace(/[:\/\-+?=#. ]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
}

export class ActiveTabIndex {
  urlIndex: Index;
  titleIndex: Index;
  contentIndex: Index;

  constructor() {
    this.urlIndex = new Index({
      tokenize: "forward",
      // charset: "latin:balance",
      resolution: 9,
      optimize: true,
    });

    this.titleIndex = new Index({
      tokenize: "forward",
      // charset: "latin:balance",
      resolution: 9,
      optimize: true,
    });

    this.contentIndex = new Index({
      tokenize: "strict",
      // charset: "latin:advanced",
      optimize: true,
      resolution: 5,
      context: {
        depth: 1,
        resolution: 3,
      },
    });
  }

  async add(tab: ActiveTab) {
    await Promise.all([
      this.titleIndex.add(tab.id, tab.title),
      this.urlIndex.add(tab.id, preTokenizeUrl(tab.url)),
      this.contentIndex.add(tab.id, tab.content),
    ]);
  }

  async search(query: string) {
    const [titleMatches, urlMatches, contentMatches] = await Promise.all([
      this.titleIndex.search(query),
      this.urlIndex.search(preTokenizeUrl(query)),
      this.contentIndex.search(query),
    ]);

    return [...titleMatches, ...urlMatches, ...contentMatches];
  }
}
