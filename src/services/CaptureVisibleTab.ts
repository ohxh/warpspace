import { crunchPreview } from "./CrunchPreview";

const LOADING_RETRY_TIME = 1000; // in ms
const LOADING_ATTEMPTS = 3;
const PREVIEW_WIDTH = 400;
const PREVIEW_HEIGHT = 400;

export async function captureVisibleTab(
  info: { windowId: number },
  partial: (partial: string) => void
) {
  try {
    var t0 = performance.now();
    var screenshot = await chrome.tabs.captureVisibleTab(info.windowId, {
      format: "jpeg",
      quality: 10,
    });
    partial(screenshot);
    t0 = performance.now();
    const result = await crunchPreview(screenshot, {
      maxWidth: PREVIEW_WIDTH,
      maxHeight: PREVIEW_HEIGHT,
      quality: 1,
      outputType: "webp",
      linearDownsampleFactor: 4,
    });
    t0 = performance.now();
    return result;
  } catch (e) {
    var tab = (
      await chrome.tabs.query({ active: true, windowId: info.windowId })
    )[0];
    if (!tab.url) return "placeholder";
    if (tab.url.startsWith("chrome://newtab")) return "newtab";
    if (tab.url.startsWith("chrome:")) return "chrome";
    if (tab.url.startsWith("data:")) return "data";
    return "placeholder";
  }
}
