import React from "react";
import { HighlightedText } from "../HighlightedText";

export function highlightStringByRegex(s: string, r: RegExp) {
  if (typeof s !== "string") return s;
  const matches = [...s.matchAll(r)];

  let bestScore = 0;

  const processedMatches: [number, number][] = matches.map(
    (m) => {
      const start = m.index!;
      const end = start + m[0].length;

      return [start, end];
    }
  );

  return <HighlightedText ranges={processedMatches} text={s} />
}