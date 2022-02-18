import { Readability } from "@mozilla/readability";
import { debug } from "./services/Logging";
import { WarpspaceFrameController } from "./content/WarpspaceFrameController";
import * as htmlToImage from 'html-to-image';
import { processHTML } from "./services/search/GeneratePreview";

// Inject the warpspace frame into the body

debug("Started content script...");

const FrameController = new WarpspaceFrameController(window);

debug("Attached event listeners...")

function extractTextContent() {
  console.log("Starting text content extraction.");

  return document.body.innerText.replace(/[ \t]+/g, " ").replace(/[\n\r][\n\r]+/g, "\n\n");
}

window.addEventListener("DOMContentLoaded", (e) => {
  setTimeout(() => {
    chrome.runtime.sendMessage({ event: "content-scraped", data: extractTextContent() })
  }, 1000)
})

document.addEventListener("scroll", debounce(() => {
  chrome.runtime.sendMessage({ event: "request-capture" })
}))

function debounce(func: () => void, timeout = 10) {
  let timer: NodeJS.Timeout;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(func, timeout);
  };
}

// Scrape: 



