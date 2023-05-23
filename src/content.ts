import { debug } from "./services/logging/log";
import { scrapeBlockElement, scrapeBody } from "./services/scraper/scrape";
import { getLiveSettings } from "./services/settings/WarpspaceSettingsContext";
import { InjectedFrameController } from "./utils/InjectedFrameController";
import { domLoaded } from "./utils/onDOMLoad";

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
  setTimeout(
    () => chrome.runtime.sendMessage({ event: "request-capture" }),
    100
  );
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
    setTimeout(
      () => chrome.runtime.sendMessage({ event: "request-capture" }),
      100
    );
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

getLiveSettings().then(async (settings) => {
  await domLoaded;

  const updateDebugUIVisible = () => {
    if (settings.developer.showDebugUI) {
      if (!document.querySelector(".warpspace-injected-debug")) {
        const frame = document.createElement("iframe");
        frame.src = chrome.runtime.getURL("debug.html");
        frame.className = "warpspace-injected-debug";
        document.body.appendChild(frame);
      }
    } else {
      document.querySelector(".warpspace-injected-debug")?.remove();
    }
  };
  updateDebugUIVisible();
  settings.onChange.addListener(updateDebugUIVisible);
});
