/** Heuristic to check if an element is hidden on the page */
export function isHidden(el: HTMLElement) {
  if (el === document.body) return false;
  var style = window.getComputedStyle(el);

  const rect = el.getBoundingClientRect();

  const isLeafNode = [...el.childNodes].some(
    (x) => x.nodeType !== Node.TEXT_NODE
  );

  return (
    (isLeafNode && rect.height + rect.width <= 1) ||
    // Invisible
    style.display === "none" ||
    style.visibility === "hidden" ||
    style.opacity === "0" ||
    // Hidden by clip -- a lot of websites use this for "skip to content"
    // screen reader text
    style.clip === "rect(0px, 0px, 0px, 0px)" ||
    style.clip === "rect(1px, 1px, 1px, 1px)" ||
    style.clip === "circle(1px)" ||
    style.clip === "circle(0px)" ||
    // Hidden by color, filter, or transform
    style.color.match(/^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+),\s*0\s*\)$/) ||
    style.filter.includes("opacity(0)") ||
    style.transform.match(
      /matrix\(0,\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)|matrix\(([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*0,\s*([\d.]+),\s*([\d.]+)\)/
    ) ||
    // Off the top of the page
    rect.top + rect.height + window.scrollY < 0
  );
}

const excludedTags = new Set([
  "STYLE",
  "SCRIPT",
  "IFRAME",
  "OBJECT",
  "SVG",
  "NOSCRIPT",
  "HEADER",
  "NAV",
  "FOOTER",
]);

/** Heuristic to check if an element should be excluded from scraping */
export function isExcluded(elm: HTMLElement) {
  return excludedTags.has(elm.tagName.toUpperCase());
}

/** Heuristic to check if an element is a block of code with line numbers, etc */
export function isCodeBlock(el: HTMLElement) {
  return el.tagName === "PRE" || el.classList.contains("cm-editor");
}

/** Heuristic to check if an element should be excluded from scraping */
export function isCodeInline(el: HTMLElement) {
  return el.tagName === "PRE" || el.classList.contains("cm-editor");
}
