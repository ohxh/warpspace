import { useLiveQuery } from "dexie-react-hooks";
import domtoimage from "dom-to-image";
import { KBarProvider, useKBar, VisualState } from "kbar";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { WarpspaceIcon } from "./components/primitives/icons/warpspace";
import { SearchBarModal } from "./components/search/SearchBar";
import { LocalStorageImage } from "./components/primitives/LocalStorageImage";
import { db, OpenVisit, TrackedWindow } from "./services/database/DatabaseSchema";
import { compressCapturedPreview } from "./services/previews/CaptureVisibleTab";
import { ImageStore } from "./services/previews/ImageStore";
import { index } from "./services/search/DexieSearchIndex";
import { BrandMenu } from "./services/settings/BrandMenu";
import { useSetting } from "./hooks/useSetting";
import { WarpspaceSettingsProvider } from "./services/settings/WarpspaceSettingsContext";
import "./styles/style.css";
import "./styles/theme.css";
import "./styles/prose.css";
import { createRoot } from "react-dom/client";
import { FooterBar } from "./components/new-tab/FooterBar";
import { NewTabApp } from "./components/new-tab/NewTabApp";

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <WarpspaceSettingsProvider>
      <NewTabApp />
    </WarpspaceSettingsProvider>
  </React.StrictMode>
);


var node = document.body;
const x = new ImageStore()

setTimeout(() =>
  domtoimage.toPng(node)
    .then(async function (dataUrl) {
      x.store("newtab", await compressCapturedPreview(dataUrl))
    })
    .catch(function (error: any) {
      console.error('oops, something went wrong!', error);
    }), 100);

chrome.runtime.sendMessage({ event: "new-tab-open" })


