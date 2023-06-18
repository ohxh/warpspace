export const separator =
  /[\s.,\/\\#!?@|<>$%\^&\*;:{}+\-=––—·•†‡◊¶⸿§©®_`…~()÷¿¡№"\[\]]+/g;

/**
 * General-purpose tokenizer for web content after normalization.
 * Splits on camelCase, white space, and punctuation
 *
 * @param s String to tokenize
 * @returns Array of tokens as string
 */
export function tokenize(s: string) {
  return s
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Break CamelCase / pascalCase words
    .split(separator) // Break on white space, punctuation
    .filter(Boolean); // Remove empty tokens
}

/**
 * General-purpose tokenizer for web content after normalization.
 * Splits on camelCase, white space, and punctuation
 *
 * @param s String to tokenize
 * @returns Array of tokens as string
 */
export function tokenizeReversible(
  s: string
): { text: string; position: [number, number] }[] {
  // Breaks in the string. [last index after token, first index of next token]
  // [5,5] will break right at index 5. [5,6] will cut out token 5
  let breaks: [number, number][] = [];

  const camelCaseRegEx = /([a-z])([A-Z])/g;
  let result: RegExpExecArray | null;

  // while ((result = camelCaseRegEx.exec(s))) {
  //   breaks.push([result.index + 1, result.index + 1]);
  // }

  // Match all non-letter/number unicode chars, except apostrophes.
  // Match all apostrophes that likely aren't contractions

  const separatorRegEx = /([^\p{L}\p{N}']|\W'|'\W)+/gu;

  while ((result = separatorRegEx.exec(s))) {
    breaks.push([result.index, result.index + result[0].length]);
  }

  breaks = breaks.sort(([a, b], [c, d]) => a - c);

  if (breaks.length === 0)
    return [{ text: s, position: [0, s.length] as [number, number] }];

  // If the last break isn't flush with the end of the string,
  // consider a token after it
  if (breaks[breaks.length - 1][1] < s.length)
    breaks.push([s.length, s.length]);

  const tokens = breaks.map(([breakStart, breakEnd], i) => {
    const lastBreakEnd = breaks[i - 1]?.[1] ?? 0;
    return {
      text: s.slice(lastBreakEnd, breakStart),
      position: [lastBreakEnd, breakStart] as [number, number],
    };
  });

  // If the first token is empty, ignore it
  if (tokens[0].position[1] === 0) return tokens.slice(1);
  return tokens;
}
