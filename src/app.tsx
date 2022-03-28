import React from "react";
import ReactDOM from "react-dom";
import { OverviewApp } from "./components/App/App";
import { FocusHider } from "./components/App/FocusHider";
import { AppSettingsProvider } from "./components/new/Settings/AppSettingsContext";
import "./components/new/Settings/theme.css";
import "./style.css";


// Hide app unless in active tab

let component = ReactDOM.render(
  <React.StrictMode>
    <AppSettingsProvider>
      <FocusHider>
        <OverviewApp />
      </FocusHider>
    </AppSettingsProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

/** Amount zoomed in from baseline before exiting warpsace. */
const EXIT_WARPSPACE_THRESHOLD = -1;

//Catch events to leave warpspace
document.addEventListener(
  "wheel",
  function (e) {
    // Pinch zoom gestures come in as ctrl + scroll for backwards compatibility
    if (e.ctrlKey) {
      if (e.deltaY < EXIT_WARPSPACE_THRESHOLD) {
        document.body.classList.add("leaving-warpspace")
        setTimeout(() => {
          window.top!.postMessage(
            { event: "exit-warpspace" },
            { targetOrigin: "*" }
          );
          setTimeout(() => document.body.classList.remove("leaving-warpspace"), 10)

        }, 130);
      }
      e.preventDefault();
    }
  },
  { passive: false }
);

document.body.style.display = "none";

window.addEventListener("message", (m) => {
  if (m.data.event === "enter-warpspace") {
    document.body.style.display = "block";
    console.warn("message sent")
    // chrome.runtime.sendMessage({ event: "register-warpspace-open" })
  }
  if (m.data.event === "exit-warpspace") {
    // chrome.runtime.sendMessage({ event: "request-capture" })
    document.body.style.display = "none";
    // chrome.runtime.sendMessage({ event: "register-warpspace-closed" })
  }
});

//@ts-ignore
chrome.tabs.getZoom((z) => {
  document.documentElement.style.fontSize = 100 / z + "%"

  document.documentElement.style.letterSpacing = .02 * (1 - z) + "em"
})

let currentTabId = 0;

chrome.tabs.getCurrent((c) => currentTabId = c!.id!);

chrome.tabs.onZoomChange.addListener((z) => {
  console.warn({ z: z.newZoomFactor })
  if (z.tabId === currentTabId)
    document.documentElement.style.fontSize = 100 / z.newZoomFactor + "%"
  document.documentElement.style.letterSpacing = .02 * (1 - z.newZoomFactor) + "em"
})



