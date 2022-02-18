import { JSDOM } from "jsdom";
import RichMarkdownEditor from "rich-markdown-editor";
// get indices

// split 1 level deep, parse to ele, text

export function processHTML(document: string, query: string) {
  const matches: [number, number][] = [];

  const separators = document.matchAll(/(([.;":!;] )|[\n\r\t])(\w)/g);

  let sentenceBreaks = [
    0,
    ...[...separators].map((v) => v.index! + v[0].length - 1),
  ];

  let bestIndex: number | undefined = undefined;
  let bestScore: number | undefined = undefined;

  sentenceBreaks.forEach((s) => {
    // sum up score of included matches
  });
}

// Count: tf-

// Start on sentence / after newline
