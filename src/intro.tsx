import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { indexHistory } from "./background";
import { db } from "./services/database/DatabaseSchema";
import { WarpspaceSettingsProvider } from "./services/settings/WarpspaceSettingsContext";
import "./styles/style.css";
import "./styles/theme.css";



const IntroTabApp = () => {

  const setup = useLiveQuery(() => db.global.get("global"), [], "default")

  const [loading, setLoading] = useState(false)
  const state = setup === "default" ? "default" : setup ? "done" : loading ? "loading" : "initial"

  const initFromHistory = () => {
    setLoading(true);
    indexHistory(() => { });
  }

  const initFromBlank = () => {
    setLoading(true)
    db.global.put({ id: "global" });
  }
  return <div className="flex flex-col w-[100vw] h-[100vh] inset-0">
    <div className="flex-1 flex flex-col w-[100vw] pb-24 mx-12 items-center place-content-start pt-[16vh] gap-y-28">


      <div className="w-full flex flex-row items-center gap-x-12 place-content-center text-5xl mt-12">
        {/* <WarpspaceIcon className="w-12 h-12" /> */}
        <div className="text-2xl text-ramp-800 select-none transition-opacity"
          style={{
            opacity: (state === "initial" || state === "loading") ? 1 : 0,
            pointerEvents: (state === "initial" || state === "loading") ? "all" : "none"
          }}
        >Welcome to Warpspace</div>
      </div>
      <div className="relative w-full  max-w-4xl">
        <div className="absolute top-0 left-0 right-0 flex flex-row gap-x-6 transition-opacity"
          style={{
            opacity: state === "initial" ? 1 : 0,
            pointerEvents: state === "initial" ? "all" : "none"
          }}
        >
          <button
            onClick={initFromHistory}
            className="select-none text-left flex flex-col place-content-start rounded-md h-40 bg-ramp-100 hover:bg-ramp-200 px-8 py-6 flex-1">
            <h1 className="text-xl font-medium flex flex-row items-center gap-x-2">
              <span>Import history from chrome</span> <ArrowRightIcon className="w-6 h-6 inline-block" />
            </h1>
            <div className="text-sm mt-2 text-ramp-700">
              Load all your chrome history into the search index. This will just index titles and urls.
            </div>
            <div className="text-sm mt-4 text-ramp-700">
              Estimated time: &lt; 1 minute
            </div>
          </button>
          <button
            onClick={initFromBlank}
            className="select-none text-left flex flex-col place-content-start rounded-md h-40 bg-ramp-100 hover:bg-ramp-200 px-8 py-6 flex-1">
            <h1 className="text-xl font-medium flex flex-row items-center gap-x-2">
              <span>Start fresh</span> <ArrowRightIcon className="w-6 h-6 inline-block" />
            </h1>
            <div className="text-sm mt-2 text-ramp-700">
              Start with a clean slate.
            </div>
          </button>
        </div>

        <div className="absolute top-0 flex flex-col w-full max-w-4xl place-content-center items-center transition-opacity"
          style={{
            opacity: state === "loading" ? 1 : 0,
            pointerEvents: state === "loading" ? "all" : "none"
          }}
        >
          <div className="text-ramp-700 text-xl">
            Setting up...
          </div>
          <div className="text-sm text-ramp-700">Estimated time remaining: under 1 minute</div>
        </div>


        <div className="ansolute top-0 flex flex-col gap-y-4 w-full max-w-4xl place-content-center items-center transition-opacity"
          style={{
            opacity: state === "done" ? 1 : 0,
            pointerEvents: state === "done" ? "all" : "none"
          }}
        >
          <div className="text-lg text-ramp-700">

            <HighlightKeyCap keyName="Meta">⌘</HighlightKeyCap>&nbsp;<HighlightKeyCap keyName="Shift">Shift</HighlightKeyCap>&nbsp;<HighlightKeyCap keyName="1">1</HighlightKeyCap>
            <span className="ml-4">to open Warpspace
            </span>
          </div>

          <div className="mt-8 text-base">
            Or <button className="border-b border-dashed cursor-pointer" onClick={() => chrome.tabs.create({ url: "chrome://extensions/shortcuts" })}>change the shortcut</button>
          </div>
        </div>
      </div>

      <div
        style={{
          opacity: state === "initial" ? 1 : 0,
          pointerEvents: state === "initial" ? "all" : "none"
        }}
        className="transition-opacity absolute bottom-16 hover:border border-dashed border-ramp-400 text-ramp-800 rounded">
        Or import from a backup...
      </div>
      {/* <div className="flex flex-row gap-x-4 place-content-center items-center mt-80">
      {[1, 2, 3, 4].map(t => <div className="tab aspect-[16/9] rounded bg-ramp-300" />)}
    </div> */}
    </div>

  </div>
};

ReactDOM.render(
  <React.StrictMode>
    <WarpspaceSettingsProvider>
      <IntroTabApp />
    </WarpspaceSettingsProvider>
  </React.StrictMode>,
  document.getElementById("root")
);



export const HighlightKeyCap: React.FC<{ keyName: string, children?: React.ReactNode }> = ({ children, keyName }) => {

  const [down, setDown] = useState(false)
  return (
    <div className={`rounded-md text-xl  px-5 py-4 inline-block transition-all border border-ramp-200 text-ramp-900  ${down ? "shadow-inner border-ramp-200 bg-ramp-100 dark:bg-ramp-0" : "shadow-md bg-ramp-0 dark:bg-ramp-100"}`}>
      {children}
    </div>
  );
};