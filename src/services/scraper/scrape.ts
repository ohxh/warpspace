import { isExcluded, isHidden } from "./utils/heuristics";
import { escapeMarkdown, escapeMarkdownCode } from "./utils/escape-markdown";

// @ts-ignore

console.log({ scrapeBlockElement });

function wrapWithLink(text: string, url: string) {
  const match = text.match(/^#+\s*/);
  const prefix = match?.[0] || "";
  const main = text.slice(prefix.length);

  // TODO if main has text, check if for links inside and remove those
  return `${prefix}[${main}](${url})`;
}

function trimWhitespace(x: string) {
  return x.replaceAll(/[\n\r\t]/g, " ").replaceAll(/\s+(\s)$/g, " ");
}

export function scrapeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return trimWhitespace(escapeMarkdown(node.textContent || ""));
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    return scrapeBlockElement(node as HTMLElement);
  } else {
    return "";
  }
}

export function scrapeBody(): string {
  return scrapeBlockElement(document.body).trim();
}

export function scrapeBlockElement(el: HTMLElement): string {
  if (isExcluded(el)) return "";
  if (el.children.length === 0 && isHidden(el)) return "";
  if (el.tagName === "SVG") return "";

  const style = window.getComputedStyle(el);

  let textContent: string;
  let childTextContents = [...el.childNodes]
    .map((n) => scrapeNode(n))
    .filter((x) => x.length > 0);

  if ([...el.childNodes].some((x) => x.nodeType === Node.TEXT_NODE)) {
    // if it has text children, return raw content
    textContent = childTextContents.join("");
  } else {
    textContent = childTextContents.join(" ");
  }

  // Experimental -- Join all two-line blocks by a space instead of a newline
  if (
    textContent.split("\n").filter(Boolean).length === 2 &&
    textContent.length < 50
  ) {
    textContent = textContent.replace(
      textContent.trim(),
      textContent.trim().replace("\n", "  ")
    );
  }

  // no starting or trailing spaces allowed
  textContent = textContent.replaceAll(/\s*\n\s*/g, "\n");

  if (textContent == "") return "";

  if (style.textTransform === "capitalize") {
    // TODO
  } else if (style.textTransform === "uppercase") {
    textContent = textContent.toUpperCase();
  } else if (style.textTransform === "lowercase") {
    textContent = textContent.toLowerCase();
  }

  if (
    textContent.includes("\n") &&
    (textContent.length <= 3 ||
      /^[0-9][0-9]?[0-9]?[0-9]?$/.test(textContent.trim()))
  )
    return "";

  switch (el.tagName.toUpperCase()) {
    case "INPUT":
      return (el as HTMLInputElement).value;
    case "SELECT":
      return "";
    case "H1":
      return `\n# ${textContent.replace(/[\s\n]+/gim, " ")}\n`;
    case "H2":
      return `\n## ${textContent.replace(/[\s\n]+/gim, " ")}\n`;
    case "H3":
      return `\n### ${textContent.replace(/[\s\n]+/gim, " ")}\n`;
    case "H4":
      return `\n#### ${textContent.replace(/[\s\n]+/gim, " ")}\n`;
    case "H5":
      return `\n##### ${textContent.replace(/[\s\n]+/gim, " ")}\n`;
    case "H6":
      return `\n###### ${textContent.replace(/[\s\n]+/gim, " ")}\n`;
    case "A":
      const url = (el as HTMLAnchorElement).href || "";
      const hasTitle = /^#+\s/gim.test(textContent);
      // todo avoid code
      return textContent
        .split("\n")
        .map((s) =>
          s.trim() && (!hasTitle || s.match(/^#+\s/))
            ? wrapWithLink(s.trim(), url)
            : s
        )
        .join("\n");
    case "BUTTON":
      return ""; //`[${scrapeInlineTextOnly(el)}]`;
    case "PRE":
      const lang = "js";
      return el.innerText.split("\n").length > 1
        ? "\n```" +
            escapeMarkdownCode(el.innerText)
              .split("\n")
              .map((x, i) => (x === "" ? `|||${i + 1} ` : `|||${i + 1} ${x}`))
              .join("```\n```") +
            "```\n"
        : "`" + escapeMarkdownCode(el.innerText).trim() + "`\n";
    case "CODE":
      return "`" + escapeMarkdownCode(el.innerText).trim() + "`";
    case "MATH":
      const katex = el.querySelector(
        `annotation[encoding="application/x-tex"]`
      )?.textContent;

      if (!katex) return "";
      else return `$$${katex}$$`;

    // case "NAV":
    // case "BLOCKQUOTE":
    // case "UL":
    // case "PRE":
    //   return text;
  }

  if (el.classList.contains("cm-editor")) {
    const lang = "js";
    return el.innerText.split("\n").length > 1
      ? "\n```" +
          escapeMarkdownCode(el.innerText)
            .split("\n")
            .map((x, i) => (x === "" ? `|||${i + 1} ` : `|||${i + 1} ${x}`))
            .join("```\n```") +
          "```\n"
      : "`" + escapeMarkdownCode(el.innerText).trim() + "`\n";
  }

  if (
    el.parentElement &&
    window.getComputedStyle(el.parentElement).display === "flex"
  ) {
    const dir = window.getComputedStyle(el.parentElement).flexDirection;
    if (dir === "row" || dir === "row-reverse") {
      return textContent;
    } else if (dir === "col" || dir === "col-reverse") {
      if (
        textContent.length <= 3 ||
        /^[0-9][0-9]?[0-9]?[0-9]?$/.test(textContent.trim())
      )
        return "";
      return textContent + "\n";
    }
  }
  if (
    ["block", "flex", "table", "grid", "list-item"].includes(
      window.getComputedStyle(el).display
    ) &&
    !textContent.endsWith("\n") &&
    // Inline content will have an inline child with an invisible block child
    // that we want to draw inline
    !isHidden(el)
  ) {
    if (
      textContent.length <= 3 ||
      /^[0-9][0-9]?[0-9]?[0-9]?$/.test(textContent.trim())
    )
      return "";
    return textContent + "\n";
  }

  if (
    ["table-row"].includes(window.getComputedStyle(el).display) &&
    !textContent.endsWith("\n") &&
    // Inline content will have an inline child with an invisible block child
    // that we want to draw inline
    !isHidden(el)
  ) {
    return textContent + "\n***\n";
  }

  if (
    ["table-cell"].includes(window.getComputedStyle(el).display) &&
    !textContent.endsWith("\n")
  )
    return textContent + " ";

  return textContent;
}

export {};
