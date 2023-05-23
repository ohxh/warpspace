/**
 * General-purpose normalizer for web content.
 * Removes accents and lower-cases.
 *
 * @param s String to tokenize
 * @returns Array of tokens as string
 */
export function normalize(s: string) {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  // .replace(/α/u, "a")
  // .replace(/β/u, "b")
  // .replace(/μ/u, "u");
}
