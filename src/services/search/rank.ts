import { map } from "lodash";
import { normalize } from "./utils/normalize";
import { separator, tokenize } from "./utils/tokenize";

const getOrigin = (x: string) => {
  let base = x.trim() ? normalize(new URL(x).hostname) : "";
  if (base.startsWith("www.")) base = base.slice(4);
  base = base.slice(0, base.lastIndexOf("."));
};
export function makeFuzzyRegex(p: string) {
  if (p.length === 1)
    return (
      '(?<=[\\s.,\\/\\\\#!?@|<>$%\\^&\\*;:{}+\\-=––—·•†‡◊¶⸿§©®_`…~()÷¿¡№"\\[\\]])' +
      p +
      "|^" +
      p
    );
  if (p.length <= 2) {
    return p;
  }
  if (p.length <= 3) {
    let abbr = p.split("").map((x) => `[\\s\\-^]${x}[a-z]+`);
    return `(${p}|${abbr})`;
  }

  let intraSlice = 1,
    intraIns = 1,
    intraSub = 1,
    intraTrn = 1,
    intraDel = 1;

  if (p.length == 4) {
    intraDel = 0;
    intraSub = 0;
  }

  let lftIdx = 1,
    rgtIdx = Infinity;
  let lftChar = p.slice(0, lftIdx); // prefix
  let rgtChar = p.slice(rgtIdx); // suffix

  let chars = p.slice(lftIdx, rgtIdx);

  // neg lookahead to prefer matching 'Test' instead of 'tTest' in ManifestTest or fittest
  // but skip when search term contains leading repetition (aardvark, aaa)
  if (intraIns == 1 && lftChar.length == 1 && lftChar != chars[0])
    lftChar += "(?!" + lftChar + ")";

  let numChars = chars.length;

  let variants = [];

  let intraChars = ".";

  // variants with single transpositions
  if (intraTrn) {
    for (let i = 0; i < numChars - 1; i++) {
      if (chars[i] != chars[i + 1])
        variants.push(
          lftChar +
            chars.slice(0, i) +
            chars[i + 1] +
            chars[i] +
            chars.slice(i + 2) +
            rgtChar
        );
    }
  }

  // variants with single char insertions
  if (intraIns) {
    let intraInsTpl = intraChars + "?";

    for (let i = 0; i < numChars; i++)
      variants.push(
        lftChar + chars.slice(0, i) + intraInsTpl + chars.slice(i) + rgtChar
      );
  }

  // variants with single char omissions
  if (intraDel) {
    for (let i = 0; i < numChars; i++)
      variants.push(
        lftChar + chars.slice(0, i + 1) + "?" + chars.slice(i + 1) + rgtChar
      );
  }

  // variants with single char substitutions
  if (intraSub) {
    for (let i = 0; i < numChars; i++)
      variants.push(
        lftChar + chars.slice(0, i) + intraChars + chars.slice(i + 1) + rgtChar
      );
  }

  if (p.length <= 5) {
    let abbr = p.split("").map((x) => `[\\s\\-^]${x}[a-z]+`);
    variants.push(abbr);
  }
  let reTpl = "(?:" + p + "|" + variants.join("|") + ")";

  //	console.log(reTpl);

  return reTpl;
}

function sum(...values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}

function rm2s(...values: number[]) {
  return sum(...values.map((x) => x ** 0.5)) ** 2;
}

function rms3(...values: number[]) {
  return sum(...values.map((x) => x ** 3)) ** (1 / 3);
}

export function rank<
  T extends { title: string; url: string; body: string; boost?: number }
>(
  query: string,
  values: T[],
  showHiddenResults?: boolean,
  maskedQuery?: string
): (T & {
  score: number;
  debug: any;
})[] {
  const t0 = performance.now();
  const terms = tokenize(query).map(normalize);
  let maskedTerms = new Set(tokenize(maskedQuery || "").map(normalize));

  if (terms.every((x) => maskedTerms.has(x))) {
    maskedQuery = "";
    maskedTerms = new Set();
  }

  if (terms.length === 0)
    return values.map((v) => ({
      ...v,
      score: 1,
      debug: {
        score: 1,
        finalScore: 1,
        threshold: 0,
      },
    }));

  // map from term to next term in query.
  // used to count bigrams
  const termAdjacencies = Object.fromEntries(
    terms.map((t, i) => [t, terms[i + 1]] as const)
  );

  // Make edit distance 1 regexes
  const regexStrings: string[] = terms.map(makeFuzzyRegex);

  const regexes: Record<string, RegExp> = {};
  regexStrings.forEach((s, i) => {
    regexes[terms[i]] = new RegExp(s, "gim");
  });

  // Boost calculated from highlight density plus other heuristics in match
  const matchQualityBoost = (
    value: string,
    highlights: [string, number, number][]
  ) => {
    if (highlights.length === 0) return 0;

    const start = highlights[0][1];
    const end = highlights[highlights.length - 1][2];

    const mismatchBefore = start;
    const mismatchAfter = value.length - end;
    const mismatchWithin = Math.max(
      end -
        start -
        highlights.map(([x, a, b]) => b - a).reduce((a, b) => b - a),
      0
    );

    const adjacentPairs = highlights.filter((match, index) => {
      const next = highlights[index + 1];
      return (
        next &&
        termAdjacencies[match[0]] === next?.[0] &&
        next[2] - match[1] < 5
      );
    });

    if (value.includes("(complexity)"))
      console.log(
        "GGGG",
        value,
        adjacentPairs.length,
        termAdjacencies,
        highlights
      );
    // Boost from not having non-matching chars in the match. At most 0.5
    const interBoost = 1.5 / (mismatchWithin + 4);

    // Boost from starting near the start of the string. At most 0.25
    const startBoost = 1 / (mismatchBefore + 4);
    // At most 0.125
    // const endBoost = 0.4 / (mismatchAfter + mismatchWithin + 2);

    // Boost from having pairs of terms that are adjacent in the query
    // adjacent in the match too. 0.15 for every pair
    const adjacencyBoost = Math.min(adjacentPairs.length, terms.length - 1) / 4;

    // Boost from starting near the start of the string. At most 0.25
    const lengthBoost = 1 / (value.length / 6 + 4);
    // Best total boost is around 0.5 for a match that is all highlight with a few terms.
    return startBoost + adjacencyBoost + lengthBoost;
  };

  // Match a single term in a single string. Return a score and a list of highlights
  function matchSingle(
    term: string,
    field: string
  ): [number, [string, number, number][]] {
    const regex = regexes[term];

    const matches = [...field.matchAll(regex)];

    let bestScore = 0;

    const processedMatches: [string, number, number, number][] = matches.map(
      (m) => {
        const perfect = term === m[0];
        const exact = term === m[0].replaceAll(separator, "");
        separator.lastIndex = 0;

        const start = m.index!;
        const end = start + m[0].length;
        const startOfToken = start === 0 || separator.test(field[start - 1]);
        separator.lastIndex = 0;
        const endOfToken = end === field.length || separator.test(field[end]);
        separator.lastIndex = 0;

        let score;

        if (perfect) score = 1;
        else if (exact) score = 0.9;
        else score = 0.7;

        if (!endOfToken) {
          // if (term.length === 1) {
          //   score -= 0.1;
          // } else score -= 0.2;

          separator.lastIndex = 0;
        }
        if (!startOfToken) score -= 0.35;

        bestScore = Math.max(bestScore, score);
        return [term, start, end, score];
      }
    );

    const filteredMatches: [string, number, number][] = processedMatches
      .filter(([term, start, end, score]) => score >= bestScore)
      .map(([term, start, end, score]) => {
        return [term, start, end];
      });

    return [bestScore, filteredMatches];
  }

  const unmaskedTerms = terms.filter((x) => !maskedTerms.has(x));

  const threshold =
    sum(...unmaskedTerms.map((t) => 0.7 ** 0.25 * weightTerm(t))) ** 4;

  function scoreTerm(t: string, v: T, debug: any) {
    const [titleScore, titleHighlights] = matchSingle(t, normalize(v.title));
    const [urlScore, urlHighlights] = matchSingle(t, normalize(v.url));
    const [originScore, originHighlights] = matchSingle(
      t,
      v.url.trim() ? normalize(new URL(v.url).hostname) : ""
    );
    const [bodyScore, bodyHighlights] = matchSingle(t, normalize(v.body));

    const score = Math.max(
      titleScore * 1.5,
      urlScore,
      originScore * 1.5,
      bodyScore * 0.7
    );
    debug[t] = score;

    return {
      term: t,
      score,
      bodyHighlights,
      titleHighlights,
      urlHighlights,
      originHighlights,
    };
  }

  function scoreDoc(v: T) {
    let debug: any = {};

    const termScores: {
      term: string;
      score: number;
      bodyHighlights: [string, number, number][];
      titleHighlights: [string, number, number][];
      urlHighlights: [string, number, number][];
      originHighlights: [string, number, number][];
    }[] = [];

    for (let i = 0; i < unmaskedTerms.length; i++) {
      let x = scoreTerm(unmaskedTerms[i], v, debug);
      if (x.score === 0 && x.term.length > 3) {
        // short-circuit if missing an important term entirely
        return {
          score: 0,
          debug: {},
        };
      }
      termScores.push(x);
    }

    let score =
      sum(
        ...termScores
          .filter((s) => !maskedTerms.has(s.term))
          .map((s, i) => s.score ** 0.25 * weightTerm(unmaskedTerms[i]))
      ) ** 4;

    // add a little for the masked terms
    const maskScore =
      sum(
        ...termScores
          .filter((s) => maskedTerms.has(s.term))
          .map((s, i) => s.score * weightTerm(terms[i]))
      ) * 0.1;

    score += maskScore;

    const titleHighlights = termScores
      .map((s) => s.titleHighlights)
      .flat()
      .sort(([x, a, b], [y, c, d]) => a - c);
    const urlHighlights = termScores
      .map((s) => s.urlHighlights)
      .flat()
      .sort(([x, a, b], [y, c, d]) => a - c);
    const originHighlights = termScores
      .map((s) => s.originHighlights)
      .flat()
      .sort(([x, a, b], [y, c, d]) => a - c);
    const titleBoost = matchQualityBoost(v.title, titleHighlights);
    const urlBoost = matchQualityBoost(v.url, urlHighlights);
    const originBoost = matchQualityBoost(
      v.url.trim() ? normalize(new URL(v.url).hostname) : "",
      originHighlights
    );

    // const titleLengthBoost = 1 + 0.4 / (v.title.length / 20 + 2);
    // const urlLengthBoost = 1 + 0.4 / (v.url.length / 20 + 2);

    let pathBoost = 0;
    let path = "";

    try {
      const url = new URL(v.url);
      pathBoost =
        url.pathname.length + url.search.length + url.hash.length <= 1
          ? 0.2
          : 0;
    } catch {}

    const finalScore =
      score * (1 + (titleBoost + urlBoost + pathBoost) / 2) * (v.boost ?? 1);

    debug = {
      ...debug,
      finalScore,
      // originBoost,
      pathBoost,
      boost: v.boost ?? 1,
      score,
      titleBoost,
      urlBoost,

      threshold,
      maskedTerms,
      regex: new RegExp(regexStrings.map((r) => `(${r})`).join("|"), "gim"),
    };

    return {
      score: finalScore,
      debug: debug,
    };
  }

  const res = values
    .map((v) => ({ ...v, ...scoreDoc(v) }))
    .sort((a, b) => b.score - a.score);
  console.log(
    "Rank over " +
      values.length +
      "terms: `" +
      query +
      "` (masked: `" +
      maskedQuery +
      "`) in " +
      (performance.now() - t0) +
      "ms"
  );
  return res;
}

const weightTerm = (x: string) => Math.log(x.length / 2 + 6) / 1.5;

function orderHighlights(x: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  const sorted = x.sort(([a, b], [c, d]) => a - c);
  sorted.forEach((highlight) => {
    if (out.length === 0) out.push(highlight);
    else if (out[out.length - 1][1] >= highlight[0]) {
      out[out.length - 1][1] = Math.max(out[out.length - 1][1], highlight[1]);
    } else out.push(highlight);
  });
  return out;
}
