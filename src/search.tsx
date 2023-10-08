import React, { useEffect } from "react";
import { KBarPositioner, KBarProvider, useKBar, VisualState } from "kbar";
import { createRoot } from "react-dom/client";
import { SearchBarModal } from "./components/search/SearchBar";
import { getLiveSettings, WarpspaceSettingsProvider } from "./services/settings/WarpspaceSettingsContext";
import "./styles/prose.css";
import "./styles/style.css";
import "./styles/theme.css";
import toast, { ToastBar, Toaster } from 'react-hot-toast';
import { usePreviousPersistent } from "./hooks/usePreviousPersistent";

export const SearchApp = () => {
  const { query, visualState } = useKBar(s => ({ visualState: s.visualState }));

  const lastVisualState = usePreviousPersistent(visualState)

  useEffect(() => {
    if (visualState === VisualState.hidden && lastVisualState === VisualState.animatingOut) {
      window.top!.postMessage(
        { event: "exit-search" },
        { targetOrigin: "*" }
      );
    }
  }, [visualState, lastVisualState])

  useEffect(() => {
    query.setVisualState(VisualState.animatingIn)
  }, [])


  return <div>
    <KBarPositioner>
      <SearchBarModal />
    </KBarPositioner>

  </div>
};



const defaults = getLiveSettings();

defaults.then(res => {

  const div = document.createElement("div")
  document.body.appendChild(div)
  div.style.opacity = "0";
  const div2 = document.createElement("div");
  div.appendChild(div2)
  const root = createRoot(div2)

  root.render(
    <WarpspaceSettingsProvider defaults={res}>
      <KBarProvider actions={[]} options={{
        animations: {
          enterMs: 0,
          exitMs: 200,
        }
      }}>
        <SearchApp />
      </KBarProvider>
    </WarpspaceSettingsProvider>
    ,

  );

  setTimeout(() => {
    const oldRoot = document.getElementById("root")!;

    Promise.all(
      oldRoot.getAnimations({ subtree: true }).map((animation) => animation.finished)
    ).then(() => {
      setTimeout(() => {
        div.style.opacity = "1";
        oldRoot.style.opacity = "0"
      }, 10)

    });
  })
}
)



chrome.tabs.getZoom((z) => {
  // document.documentElement.style.transform = `scale(${1 / z})`
  document.documentElement.style.fontSize = 100 / z + "%"
  document.documentElement.style.letterSpacing = .02 * (1 - z) + "em"
})

let currentTabId = 0;

chrome.tabs.getCurrent((c) => currentTabId = c!.id!);

chrome.tabs.onZoomChange.addListener((z) => {
  // document.documentElement.style.transform = `scale(${1 / z.newZoomFactor})`
  if (z.tabId === currentTabId)
    document.documentElement.style.fontSize = 100 / z.newZoomFactor + "%"
  document.documentElement.style.letterSpacing = .02 * (1 - z.newZoomFactor) + "em"
})