import stopWords from "./stop-words.json";

function makeWordFilter(list: string[]) {
  const filter = new Set<string>();
  list.forEach((w) => filter.add(w));
  return (x: string) => filter.has(x);
}

export const isStopWord = makeWordFilter(stopWords);
