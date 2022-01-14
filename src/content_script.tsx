import { Readability } from "@mozilla/readability";
import { debug } from "./services/Logging";
import { ActiveTab } from "./services/SearchIndex";
import { WarpspaceFrameController } from "./content/WarpspaceFrameController";
import * as htmlToImage from 'html-to-image';

// Inject the warpspace frame into the body

debug("Started content script...");

const FrameController = new WarpspaceFrameController(window);

debug("Attached event listeners...")


document.addEventListener("scroll", debounce(() => {
  chrome.runtime.sendMessage({ event: "request-capture" })
}))

function debounce(func: () => void, timeout = 1000) {
  let timer: NodeJS.Timeout;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(func, timeout);
  };
}
