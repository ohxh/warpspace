/** Converts a URL to our canonical form.
 *  We want to, where possible, merge identical pages, while avoiding
 *  false positives. Returns the URL unchanged if parsing failed.
 */
export function normalizeURL(x: string) {
  try {
    let u = new URL(x);
    u.hash = "";
    if (u.protocol === "http:") {
      u.protocol = "https:";
    }
    if (u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.href;
  } catch (e) {
    return x;
  }
}

export function stripHash(x: string) {
  try {
    let u = new URL(x);
    u.hash = "";

    return u.href;
  } catch (e) {
    return x;
  }
}
