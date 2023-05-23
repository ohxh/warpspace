import { result } from "lodash";
import { crunchPreview } from "./CrunchPreview";

const LOADING_RETRY_TIME = 1000; // in ms
const LOADING_ATTEMPTS = 3;
const PREVIEW_WIDTH = 400; //240;
const PREVIEW_HEIGHT = 400; //135;

export async function captureVisibleTab(info: { windowId: number }) {
  try {
    var t0 = performance.now();
    var screenshot = await chrome.tabs.captureVisibleTab(info.windowId, {
      format: "jpeg",
      quality: 40,
    });
    return screenshot;
  } catch (e) {
    var tab = (
      await chrome.tabs.query({ active: true, windowId: info.windowId })
    )[0];
    console.error("Capture failed", e, tab.url);
    if (!tab.url) return "newtab";
    if (tab.url.startsWith("chrome://newtab")) {
      console.error("b/c newtab");
      return "newtab";
    }
    if (tab.url.startsWith("chrome:")) return "chrome";
    if (tab.url.startsWith("data:")) return "data";
    throw e;
  }
}

export async function compressCapturedPreview(screenshot: string) {
  const t = performance.now();
  const result = await crunchPreview(screenshot, {
    maxWidth: PREVIEW_WIDTH,
    maxHeight: PREVIEW_HEIGHT,
    quality: 80,
    outputType: "webp",
    linearDownsampleFactor: 4,
  });

  return result;
}
