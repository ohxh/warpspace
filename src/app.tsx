import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { WarpspaceWindow } from "./components/Window/Window";
import { ActiveVisit, db } from "./services/Database";
import { HydratedWindow } from "./services/TabStore";
import "./style.css";
import { Header } from "./components/Header/Header";
import { ReactSortable } from "react-sortablejs";
import { Tab } from "./components/Window/Tab";
import { DocumentTextIcon, PlusIcon } from "@heroicons/react/outline";
import { useDebounce } from "@react-hook/debounce";
import produce from "immer";
import "./components/new/Settings/theme.css"
import { AppSettingsProvider } from "./components/new/Settings/AppSettingsContext";
import { OverviewTab } from "./components/new/OverviewTab/OverviewTab";
import { OverviewApp } from "./components/new/App/App";
import { FocusHider } from "./components/new/App/FocusHider";

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
      console.warn(e.deltaY);
      if (e.deltaY < EXIT_WARPSPACE_THRESHOLD) {
        console.log("trying to leave");
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

