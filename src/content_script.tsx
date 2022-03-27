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

chrome.runtime.sendMessage({ event: "request-capture" })

window.addEventListener("DOMContentLoaded", (e) => {
  setTimeout(() => {
    chrome.runtime.sendMessage({ event: "content-scraped", data: extractTextContent() })
    chrome.runtime.sendMessage({ event: "request-capture" })
  }, 1000)
})

const handleEv = debounce(() => {
  console.warn("requested capture")
  chrome.runtime.sendMessage({ event: "request-capture" })
});

function debounce(func: () => void, timeout = 200) {
  let timer: NodeJS.Timeout;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(func, timeout);
  };
}

const events = ["scroll", "click", "change", "keydown", "resize"]

events.forEach(e => window.addEventListener(e, handleEv, { capture: true }))



