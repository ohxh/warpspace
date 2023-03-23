import { intersection } from "lodash";
import { pseudoIDFValues } from "./pseudoIDFValues";

/** Ranking function for full text.  */
export function fullTextScore(
  queryCounts: Map<string, number>,
  docCounts: Map<string, number>,
  docTokenLength: number
) {
  let total = 0;
  let intersection = 0;

  // Scale a count to between zero and 1
  // This gives a single mention ~75% the weight of infinite mentions
  // But ensures the function is monotone all the way to infinity
  const scale = (x: number) => 1 - 1 / (3 * x + 1);

  queryCounts.forEach((count, token) => {
    const docCount = docCounts.get(token) ?? 0;
    intersection += count * scale(docCount) * (pseudoIDFValues[token] ?? 1);
    total += count * (pseudoIDFValues[token] ?? 1);
  });

  if (total + intersection === 0) return 0;
  return intersection / total;
}
