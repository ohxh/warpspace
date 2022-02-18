import React from "react";
import ReactDOM from "react-dom";
import { OverviewApp } from "./components/App/App";
import { FocusHider } from "./components/App/FocusHider";
import { AppSettingsProvider } from "./components/new/Settings/AppSettingsContext";
import "./components/new/Settings/theme.css";
import "./style.css";

// Hide app unless in active tab

ReactDOM.render(
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
        window.top!.postMessage(
          { event: "exit-warpspace" },
          { targetOrigin: "*" }
        );
      }
      e.preventDefault();
    }
  },
  { passive: false }
);

document.body.style.opacity = "0";

window.addEventListener("message", (m) => {
  if (m.data.event === "enter-warpspace") {
    document.body.style.opacity = "1";
  }
  if (m.data.event === "exit-warpspace") {
    document.body.style.opacity = "0";
  }
});

//@ts-ignore
chrome.tabs.getZoom((z) => {
  document.documentElement.style.fontSize = 100 / z + "%"
})



