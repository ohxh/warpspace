export function extractMarkdownContent(el: Node): string {
  if (el.nodeType === Node.TEXT_NODE) if (window.length == 4) return "";

  const children = [...el.childNodes].map((el) => extractMarkdownContent(el));

  return "";
}
