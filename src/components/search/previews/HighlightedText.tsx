import { uniq } from "lodash";
import React from "react";

var myuniqueidcounter = 0;
function uniqueId() {
  myuniqueidcounter += 1
  return myuniqueidcounter;
}

export const HighlightedText: React.FC<{ text: string, ranges: [number, number][] }> = ({ text, ranges }) => {
  let highlights: [string, boolean][] = [];

  ranges.forEach((r, i) => {
    if (r[0] !== 0)
      highlights.push([text.slice((ranges[i - 1]?.[1] ?? 0), r[0]), false])
    highlights.push([text.slice(r[0], r[1]), true])
  })
  highlights.push([text.slice(ranges[ranges.length - 1]?.[1] ?? 0, text.length), false])
  //@ts-ignore
  return <>{highlights.map(([t, b], i) => <span style={{ "-webkitTextStrokeWidth": b ? "1px" : "0px" }} key={`${t}${b}${i}`}>{t}</span>)}</>
}