import { debug } from "./services/logging/log";
import { scrapeBlockElement, scrapeBody } from "./services/scraper/scrape";
import { InjectedFrameController } from "./utils/InjectedFrameController";

//@ts-ignore
window["scrapeElement"] = (x: any) => scrapeBlockElement(x);
setTimeout(() => {
  //@ts-ignore

  console.log(window["scrapeElement"](document.body.children[0]));
}, 2000);

//@ts-ignore

// Inject the warpspace frame into the body

debug("Started content script...");

//@ts-ignore
// window["scrape"] = scrapeBlockElement;

// console.log(scrapeBlockElement(document.body).replaceAll("\n", "\n\n"));

if (self === top) {
  const controller = new InjectedFrameController("search");

  debug("Attached event listeners...");

  function extractTextContent() {
    console.log("Starting text content extraction.");

    return scrapeBody();
  }

  const flasher = document.createElement("div");
  flasher.className = "flasher";
  window.addEventListener(
    "DOMContentLoaded",
    () => document.body.appendChild(flasher),
    { once: true }
  );

  const flash = () => {
    flasher.classList.add("flash");
    setTimeout(() => flasher.classList.remove("flash"), 100);
  };

  if (document.body) {
    setTimeout(() => {
      console.log(extractTextContent());
      chrome.runtime.sendMessage({
        event: "content-scraped",
        data: {
          title: window.document.title,
          url: window.location.href,
          body: extractTextContent(),
        },
      });
    }, 1000);
  } else
    window.addEventListener(
      "DOMContentLoaded",
      (e) => {
        console.log(extractTextContent());
        setTimeout(() => {
          chrome.runtime.sendMessage({
            event: "content-scraped",
            data: {
              title: window.document.title,
              url: window.location.href,
              body: extractTextContent(),
            },
          });
        }, 1000);
      },
      { once: true }
    );
}

const handleEv = debounce(() => {
  chrome.runtime.sendMessage({ event: "request-capture" });
});

function debounce(func: () => void, timeout = 200) {
  let timer: NodeJS.Timer;
  return (x: any) => {
    clearTimeout(timer);
    timer = setTimeout(func, timeout);
  };
}

document.addEventListener("visibilitychange", (e) => {
  if (document.visibilityState === "visible")
    chrome.runtime.sendMessage({ event: "request-capture" });
});

const events = [
  "scroll",
  "mousedown",
  "mouseup",
  "change",
  "keydown",
  "resize",
  "load",
  "DOMContentLoaded",
];

events.forEach((e) => window.addEventListener(e, handleEv, { capture: true }));
