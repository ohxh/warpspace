import { debug, info } from "../services/Logging";

/** Amount zoomed out from baseline before entering warpsace. */
const ENTER_WARPSPACE_THRESHOLD = 1;
const EXIT_WARPSPACE_THRESHOLD = -1;

/** Duration in ms to block zoom events */
const EXIT_WARPSPACE_ZOOM_BLOCK = 500;

export class WarpspaceFrameController {
  // Global scope stuff for entering and exiting warpspace

  /** Whether warpspace is open in the current tab */
  warpspaceOpen = false;

  frame: HTMLIFrameElement;

  window: Window;

  // Chrome has pinch-to-zoom on the trackpad (outside of normal page zoom)
  // We want to discard pinch gestures if they are undoing an earlier zoom, but
  // we can't measure the current state, so we have to just try to track changes.
  // This is unfortunate, and breaks on refreshes.

  /** Current estimated pinch zoom */
  pinchZoomLevel = 0;
  scrollStartPinchZoomLevel = 0;

  zoomBlocked = false;
  zoomBlockTimeout: number | undefined = undefined;

  constructor(window: Window) {
    this.window = window;
    // Initialize frame
    const container = document.createElement("div");
    container.id = "warpspace-injected-app-container";
    const frame = document.createElement("iframe");
    frame.src = chrome.runtime.getURL("app.html");
    frame.id = "warpspace-injected-app";
    // frame.style.opacity = "0";
    frame.style.pointerEvents = "none";
    this.frame = frame;

    window.addEventListener("visibilitychange", (e) => {
      if (document.hidden && this.warpspaceOpen) this.exitWarpspace();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key == "Escape") this.exitWarpspace();
    });
    document.addEventListener("wheel", this.onWheel, { passive: false });

    window.addEventListener("DOMContentLoaded", (event) => {
      document.body.appendChild(container);
      container.appendChild(frame);
      debug("DOM loaded, attached frame");
    });

    window.addEventListener("message", (m) => {
      //@ts-ignore
      if (m.data["event"] === "exit-warpspace") this.exitWarpspace();
    });

    chrome.runtime.onMessage.addListener((message, sender) => {
      if (message.type === "enter-warpspace") this.enterWarpspace();
    });
  }

  handlePinch = debounce(
    () => (this.scrollStartPinchZoomLevel = this.pinchZoomLevel),
    200
  );

  onWheel = (e: WheelEvent) => {
    //Pinch zoom gestures come in as ctrl + scroll for backwards compatibility
    if (e.ctrlKey) {
      if (this.zoomBlocked) {
        // No pinch to zoom inside warpspace at all
        e.preventDefault();
      } else {
        this.pinchZoomLevel += e.deltaY;
        if (this.pinchZoomLevel > 0) this.pinchZoomLevel = 0;

        // Do our debounce stuff
        if (e.deltaY >= 0) this.handlePinch();
        else this.scrollStartPinchZoomLevel = this.pinchZoomLevel;

        console.warn(
          e.deltaY > ENTER_WARPSPACE_THRESHOLD,
          this.scrollStartPinchZoomLevel == 0
        );
        if (
          e.deltaY > ENTER_WARPSPACE_THRESHOLD &&
          this.scrollStartPinchZoomLevel == 0
        ) {
          this.enterWarpspace();
        } else if (e.deltaY < EXIT_WARPSPACE_THRESHOLD) {
          this.exitWarpspace();
        }
      }
    }
  };

  enterWarpspace = () => {
    if (this.warpspaceOpen) return;
    this.frame.contentWindow!.postMessage({ event: "enter-warpspace" }, "*");
    this.pinchZoomLevel = 0;
    this.warpspaceOpen = true;

    this.zoomBlocked = true;
    this.window.clearTimeout(this.zoomBlockTimeout);

    // this.frame.style.opacity = "1";
    this.frame.style.pointerEvents = "auto";

    info("Entered warpspace.");
  };

  exitWarpspace = () => {
    if (!this.warpspaceOpen) return;
    this.pinchZoomLevel = 0;
    this.warpspaceOpen = false;
    // this.frame.style.opacity = "0";
    this.frame.style.pointerEvents = "none";

    this.zoomBlockTimeout = this.window.setTimeout(() => {
      this.zoomBlocked = false;
    }, EXIT_WARPSPACE_ZOOM_BLOCK);

    this.frame.contentWindow!.postMessage({ event: "exit-warpspace" }, "*");

    info("Exited warpspace.");
  };

  // // Close on window losing focus
  // window.addEventListener('blur', exitWarpspace);

  // window.addEventListener("message", (event) => {
  //   info("Received message from frame to toggle warpspace.");
  //   if (event.data.event === "exit-warpspace")
  //     exitWarpspace()
  // });

  // // Open / close when keyboard shortcuts come in
  // chrome.runtime.onMessage.addListener((msg, sender) => {
  //   info("Received keyboard shortcut to toggle warpspace.");
  //   if (msg.message == "toggle_warpspace")
  //     warpspaceOpen ? exitWarpspace() : enterWarpspace();
  // });
}

function debounce(func: () => void, timeout = 500) {
  let timer: NodeJS.Timeout;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(func, timeout);
  };
}
