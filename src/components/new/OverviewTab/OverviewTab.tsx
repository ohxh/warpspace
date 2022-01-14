// import React from "react";
// import { OverviewTabContent } from "./OverviewTabContent";
// import { SingleTabContextMenu } from "./SingleContextMenu";

import React, { useEffect, useRef } from "react";
import { OverviewTabContextMenu } from "./OverviewTabContextMenu";
import "./overview-tab.css";
import { XIcon } from "@heroicons/react/outline";
import { current } from "immer";
import { ActiveVisit } from "../../../services/Database";
import { ChromeIcon } from "../../Window/ChromeIcon";
import { LocalStorageImage } from "../../Window/Tab";
import { WorldIcon } from "../../Window/WorldIcon";
import { useDebounce } from "@react-hook/debounce";
import { useTabSelection } from "../App/SelectionContext";

export const OverviewTab: React.FC<{ current: Boolean, tab: ActiveVisit, tabRef: (x: HTMLElement | null) => void }> = ({ current, tabRef, tab, }) => {

  const ref = useRef<HTMLButtonElement | null>(null);
  const [zoomingIn, setZoomingInDebounce, setZoomingIn] = useDebounce(false, 300);

  useEffect(() => {
    window.addEventListener("message", (m) => {
      if (current && m.data.event === "enter-warpspace") {
        ref.current?.focus({ preventScroll: true })
        ref.current?.scrollIntoView({ block: "nearest", inline: "center" })
        console.warn("Focusing" + tab.metadata.title, ref.current)
        setZoomingIn(true);
        setZoomingInDebounce(false);
      }
    });
    // document.body.style.opacity = '0'
  })

  useEffect(() => {
    if (current) {
      // ref.current!.scrollIntoView({ block: "center", inline: "center" })
    }
  }, [])

  return <div key={tab.id} className="tab" id={`${tab.id}`}>
    <div className="selection sortable-selected:bg-highlight sortable-ghost:hidden"></div>
    <OverviewTabContextMenu>
      <button
        data-tab-id={tab.id}
        key={tab.id}
        onClick={(e) => {
          if (e.altKey || e.ctrlKey) return;
          if (current) {
            window.top!.postMessage(
              { event: "exit-warpspace" },
              { targetOrigin: "*" }
            );
          } else {
            chrome.windows.update(tab.chromeWindowId, { focused: true })
            chrome.tabs.update(tab.chromeId, { active: true })
          }
        }
        }
        ref={e => { tabRef(e); ref.current = e; }}
        className={`focus:outline-none group grid-tab w-full cursor-default text-left bg-none relative`}>
        <div className={`sortable-handle relative bg-gray-100 aspect-[16/9] w-full rounded-md sortable-drag:group-focus:ring-0 sortable-drag:group-focus:ring-offset-0 group-focus:ring-[3px] group-focus:ring-focus ring-offset-background sortable-selected:ring-offset-highlight group-focus:ring-offset-2 group-focus:relative group-focus:z-20`}>
          <div className="absolute inset-9 rounded-md grid place-items-center grayscale opacity-20">
            {tab.metadata.favIconUrl && <img src={tab.metadata.favIconUrl} alt="hi" className="mt-[1px] w-8 h-8 rounded"></img>}
            {!tab.metadata.favIconUrl && !tab.metadata.url && <ChromeIcon className="mt-[1px] w-7 h-7 rounded-sm text-gray-800" />}
            {!tab.metadata.favIconUrl && tab.metadata.url && <WorldIcon className="mt-[1px] w-8 h-8 rounded-sm text-gray-800" />}
          </div>
          {tab.crawl.lod == 1 && tab.crawl.previewImage && <LocalStorageImage srcKey={tab.crawl.lod === 1 ? (tab.crawl.previewImage || "none") : "none2"} className={`absolute inset-0 rounded-md object-cover h-full w-full ${zoomingIn ? "zoomout" : ""}`} />}
          <div className="absolute inset-0 rounded-md border border-gray-300"></div>
          <div className="absolute inset-0 rounded-md bg-black opacity-0 group-active:opacity-0 transition-opacity duration-[50ms] sortable-drag:hidden"></div>
          <MultiSelectionDragOverlay />
        </div>
        <div className="relative mt-2">
          <div className="flex flex-row gap-x-2 items-center px-[1px] title">
            {tab.metadata.favIconUrl && <img src={tab.metadata.favIconUrl} alt="hi" className="mt-[1px] w-[18px] h-[18px] rounded-sm "></img>}
            {!tab.metadata.favIconUrl && !tab.metadata.url && <ChromeIcon className="mt-[1px] w-[15px] h-[15px] rounded-sm text-gray-800" />}
            {!tab.metadata.favIconUrl && tab.metadata.url && <WorldIcon className="mt-[1px] w-[18px] h-[18px] rounded-sm text-gray-800" />}
            <span className="flex-1 text-ellipsis whitespace-nowrap overflow-hidden text-[14px] antialiased text-gray-900" >
              {!tab.metadata.url && "New Tab"}
              {tab.metadata.title}
            </span>
          </div>
          <div className="opacity-0 hover:opacity-100 transition-opacity absolute right-0 top-0 bottom-0 flex flex-row items-center pl-6 bg-gradient-to-r from-transparent via-background to-background sortable-drag:hidden sortable-selected:via-highlight sortable-selected:to-highlight">
            <button className="rounded-sm p-1 tab-x-button active:bg-gray-100 sortable-selected:active:bg-focus">
              <XIcon className="w-[14px] h-[14px] text-gray-800"></XIcon>
            </button>
          </div>
        </div>
      </button>
    </OverviewTabContextMenu>
  </div >
}

export const MultiSelectionDragOverlay: React.FC<{}> = ({ }) => {
  const selection = useTabSelection()

  if (selection.length === 0) return <></>;
  else return <><div className="absolute inset-0 bg-focus opacity-30  rounded-md invisible sortable-group-drag:visible">
  </div>
    <div className="absolute inset-0 rounded-md invisible sortable-group-drag:visible grid place-items-center">
      <div className="text-focus text-xl">{selection.length} tab{selection.length > 1 ? "s" : ""}</div>
    </div>
  </>

}