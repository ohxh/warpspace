/** Split a string into its trigrams. */
export function trigrams(value: string | undefined | null, pad = false) {
  const grams: string[] = [];

  if (value === null || value === undefined || value.trim() === "") {
    return grams;
  }

  const source = "  " + value;
  let index = source.length - 2;

  if (index < 1) {
    return grams;
  }

  while (index--) {
    grams[index] = source.slice(index, index + 3);
  }

  // console.log("!!! trigrams ", value, grams);
  return grams;
}

// want to penalize tokens missing from query way worse than tokens missing from
export function pseudoSorensonDiceScore(
  queryCounts: Map<string, number>,
  docCounts: Map<string, number>,
  docTokenLength: number
) {
  let intersection = 0;
  let queryNotDoc = 0;

  queryCounts.forEach((count, token) => {
    const docCount = docCounts.get(token) ?? 0;
    if (count > docCount) {
      intersection += docCount;
      queryNotDoc += count - docCount;
    } else {
      intersection += count;
    }
  });

  if (intersection + queryNotDoc === 0) return 0;
  return intersection / (intersection + queryNotDoc);
}
