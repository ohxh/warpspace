import { Readability } from "@mozilla/readability";
import { debug, info, trace } from "./Logging";

export interface PageTextContent {
  url: string;
  title: string;
  textContent: string;
  content: string;
  siteName: string;
  byline?: string;
}

export function extractTextContent(): PageTextContent {
  trace("Starting text content extraction.");
  const raw = new Readability(document).parse();

  trace(
    raw
      ? "Readability succeeded."
      : "Readability failed to extract; falling back."
  );

  return {
    url: document.location.href,
    title: document.head.title,
    textContent: raw?.textContent ?? document.body.innerText,
    content: raw?.content ?? document.body.innerText,
    byline: raw?.byline,
    siteName: raw?.siteName ?? document.location.host,
  };
}

/** Whether the page has changed and we are waiting for it to finish loading. */
var contentsDirty: boolean = true;

async function dirty() {
  // check if dirty spa, re-extract after delay
}

async function extract() {
  contentsDirty = false;
  const result = extractTextContent();

  info("Extracted page text content: ", result);
  await chrome.runtime.sendMessage({
    event: "extracted-text",
    data: extractTextContent(),
  });
  info("Sent content to background service worker.");
}

window.addEventListener("DOMContentLoaded", (event) => {
  debug("DOM loaded, attached reader");
  extract();
});

let scrollTimeout: number | undefined = undefined;

window.addEventListener("scroll", (event) => {
  trace("Scrolled, resetting timeout");
  window.clearTimeout(scrollTimeout);
  scrollTimeout = window.setTimeout(() => {}, 100);
});
