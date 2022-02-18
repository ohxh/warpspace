/**
 * JavaScript version of the Porter Stemmer.
 * Taken from http://tartarus.org/~martin and lunr.js implementation:
 * https://github.com/olivernn/lunr.js/blob/master/lib/stemmer.js
 */

const step2list: Record<string, string> = {
    ational: "ate",
    tional: "tion",
    enci: "ence",
    anci: "ance",
    izer: "ize",
    bli: "ble",
    alli: "al",
    entli: "ent",
    eli: "e",
    ousli: "ous",
    ization: "ize",
    ation: "ate",
    ator: "ate",
    alism: "al",
    iveness: "ive",
    fulness: "ful",
    ousness: "ous",
    aliti: "al",
    iviti: "ive",
    biliti: "ble",
    logi: "log",
  },
  step3list: Record<string, string> = {
    icate: "ic",
    ative: "",
    alize: "al",
    iciti: "ic",
    ical: "ic",
    ful: "",
    ness: "",
  },
  c = "[^aeiou]", // consonant
  v = "[aeiouy]", // vowel
  C = c + "[^aeiouy]*", // consonant sequence
  V = v + "[aeiou]*", // vowel sequence
  mgr0 = "^(" + C + ")?" + V + C, // [C]VC... is m>0
  meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$", // [C]VC[V] is m=1
  mgr1 = "^(" + C + ")?" + V + C + V + C, // [C]VCVC... is m>1
  s_v = "^(" + C + ")?" + v; // vowel in stem

const re_mgr0 = new RegExp(mgr0);
const re_mgr1 = new RegExp(mgr1);
const re_meq1 = new RegExp(meq1);
const re_s_v = new RegExp(s_v);

const re_1a = /^(.+?)(ss|i)es$/;
const re2_1a = /^(.+?)([^s])s$/;
const re_1b = /^(.+?)eed$/;
const re2_1b = /^(.+?)(ed|ing)$/;
const re_1b_2 = /.$/;
const re2_1b_2 = /(at|bl|iz)$/;
const re3_1b_2 = new RegExp("([^aeiouylsz])\\1$");
const re4_1b_2 = new RegExp("^" + C + v + "[^aeiouwxy]$");

const re_1c = /^(.+?[^aeiou])y$/;
const re_2 =
  /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;

const re_3 = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;

const re_4 =
  /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
const re2_4 = /^(.+?)(s|t)(ion)$/;

const re_5 = /^(.+?)e$/;
const re_5_1 = /ll$/;
const re3_5 = new RegExp("^" + C + v + "[^aeiouwxy]$");

export function porterStemmer(token: string) {
  var stem, suffix, firstch, re, re2, re3, re4;

  if (token.length < 3) {
    return token;
  }

  firstch = token.substr(0, 1);
  if (firstch == "y") {
    token = firstch.toUpperCase() + token.substr(1);
  }

  // Step 1a
  re = re_1a;
  re2 = re2_1a;

  if (re.test(token)) {
    token = token.replace(re, "$1$2");
  } else if (re2.test(token)) {
    token = token.replace(re2, "$1$2");
  }

  // Step 1b
  re = re_1b;
  re2 = re2_1b;
  if (re.test(token)) {
    var fp = re.exec(token);
    re = re_mgr0;
    if (re.test(fp![1])) {
      re = re_1b_2;
      token = token.replace(re, "");
    }
  } else if (re2.test(token)) {
    var fp = re2.exec(token);
    stem = fp![1];
    re2 = re_s_v;
    if (re2.test(stem)) {
      token = stem;
      re2 = re2_1b_2;
      re3 = re3_1b_2;
      re4 = re4_1b_2;
      if (re2.test(token)) {
        token = token + "e";
      } else if (re3.test(token)) {
        re = re_1b_2;
        token = token.replace(re, "");
      } else if (re4.test(token)) {
        token = token + "e";
      }
    }
  }

  // Step 1c - replace suffix y or Y by i if preceded by a non-vowel which is not the first letter of the word (so cry -> cri, by -> by, say -> say)
  re = re_1c;
  if (re.test(token)) {
    var fp = re.exec(token);
    stem = fp![1];
    token = stem + "i";
  }

  // Step 2
  re = re_2;
  if (re.test(token)) {
    var fp = re.exec(token);
    stem = fp![1];
    suffix = fp![2];
    re = re_mgr0;
    if (re.test(stem)) {
      token = stem + step2list[suffix];
    }
  }

  // Step 3
  re = re_3;
  if (re.test(token)) {
    var fp = re.exec(token);
    stem = fp![1];
    suffix = fp![2];
    re = re_mgr0;
    if (re.test(stem)) {
      token = stem + step3list[suffix];
    }
  }

  // Step 4
  re = re_4;
  re2 = re2_4;
  if (re.test(token)) {
    var fp = re.exec(token);
    stem = fp![1];
    re = re_mgr1;
    if (re.test(stem)) {
      token = stem;
    }
  } else if (re2.test(token)) {
    var fp = re2.exec(token);
    stem = fp![1] + fp![2];
    re2 = re_mgr1;
    if (re2.test(stem)) {
      token = stem;
    }
  }

  // Step 5
  re = re_5;
  if (re.test(token)) {
    var fp = re.exec(token);
    stem = fp![1];
    re = re_mgr1;
    re2 = re_meq1;
    re3 = re3_5;
    if (re.test(stem) || (re2.test(stem) && !re3.test(stem))) {
      token = stem;
    }
  }

  re = re_5_1;
  re2 = re_mgr1;
  if (re.test(token) && re2.test(token)) {
    re = re_1b_2;
    token = token.replace(re, "");
  }

  // and turn initial Y back to y

  if (firstch == "y") {
    token = firstch.toLowerCase() + token.substr(1);
  }

  return token;
}
