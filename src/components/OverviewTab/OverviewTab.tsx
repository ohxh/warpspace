// import React from "react";
// import { OverviewTabContent } from "./OverviewTabContent";
// import { SingleTabContextMenu } from "./SingleContextMenu";

import React, { useEffect, useRef, useState } from "react";
import { OverviewTabContextMenu } from "./OverviewTabContextMenu";
import "./overview-tab.css";
import { XIcon } from "@heroicons/react/outline";
import { current } from "immer";
import { ActiveVisit } from "../../services/Database";
import { useDebounce } from "@react-hook/debounce";

import { useTabSelection } from "../App/SelectionContext";
import { LocalStorageImage } from "../LocalStorageImage";
import { ChromeIcon } from "../Window/ChromeIcon";
import { WorldIcon } from "../Window/WorldIcon";
import { CogIcon, LockClosedIcon } from "@heroicons/react/solid";

// Mousedown effect enabled
// Drag start, effect disabled
// Drag end
// Mouse move
// Effect re-enabled

export const OverviewTab: React.FC<{
  current: Boolean;
  tab: ActiveVisit;
  tabRef: (x: HTMLElement | null) => void;
}> = ({ current, tabRef, tab }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const [zoomingIn, setZoomingInDebounce, setZoomingIn] = useDebounce(
    false,
    250
  );

  useEffect(() => {
    window.addEventListener("message", (m) => {
      if (current && m.data.event === "enter-warpspace") {
        ref.current?.focus({ preventScroll: true });
        ref.current?.scrollIntoView({ block: "nearest", inline: "center" });
        setZoomingIn(true);
        setZoomingInDebounce(false);
      }
    });
    // document.body.style.opacity = '0'
  });

  useEffect(() => {
    if (current) {
      // ref.current!.scrollIntoView({ block: "center", inline: "center" })
    }
  }, []);

  const top = imageRef.current?.getBoundingClientRect().top || 0;
  const left = imageRef.current?.getBoundingClientRect().left || 0;
  const right = imageRef.current?.getBoundingClientRect().right || 0
  const bottom = imageRef.current?.getBoundingClientRect().bottom || 0;

  const [press, setPress] = useState(false)
  return (
    <div key={tab.id} className="tab" id={`${tab.id}`}>
      <div className="selection sortable-selected:bg-highlight sortable-ghost:hidden"></div>
      <OverviewTabContextMenu>
        <div
          tabIndex={1}
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
              chrome.windows.update(tab.chromeWindowId, { focused: true });
              chrome.tabs.update(tab.chromeId, { active: true });
            }
          }}
          ref={(e) => {
            tabRef(e);
            ref.current = e;
          }}
          className={`focus:outline-none group grid-tab w-full cursor-default text-left bg-none relative`}
        >
          <div
            onMouseDown={(e) => {
              setPress(true);
            }}
            onMouseMove={(e) => setPress(false)}
            ref={imageRef}
            className={`${tab.position.pinned ? "" : "sortable-handle"
              }  relative bg-gray-100 aspect-[16/9] 
              w-full rounded-md sortable-drag:group-focus:ring-0 group-active:ring-0 
              sortable-drag:group-focus:ring-offset-0 group-focus:ring-1.5 
              group-focus:ring-focus ring-offset-background sortable-selected:ring-offset-highlight 
              group-focus:ring-offset-2 group-focus:relative group-focus:z-20`}
          >
            <div className="absolute inset-0 rounded-md grid place-items-center grayscale opacity-20  ">
              {tab.metadata.favIconUrl && (
                <img
                  src={tab.metadata.favIconUrl}
                  alt="hi"
                  className="mt-[0.125rem] w-8 h-8 rounded"
                ></img>
              )}
              {!tab.metadata.favIconUrl &&
                !tab.metadata.url &&
                tab.isNewTabPage && (
                  <ChromeIcon className="mt-[0.125rem] w-7 h-7 rounded-sm text-gray-800" />
                )}
              {!tab.metadata.favIconUrl &&
                !tab.metadata.url &&
                !tab.isNewTabPage && (
                  <CogIcon className="mt-[0.125rem] w-7 h-7 rounded-sm text-gray-800" />
                )}
              {!tab.metadata.favIconUrl && tab.metadata.url && (
                <WorldIcon className="mt-[0.125rem] w-8 h-8 rounded-sm text-gray-800" />
              )}
            </div>

            <LocalStorageImage
              srcKey={
                tab.crawl.lod === 1 ? tab.crawl.previewImage || "none" : "none2"
              }
              className={`
              absolute inset-0 rounded-md object-cover h-full w-full ${zoomingIn ? "zoomout" : ""
                }`}
              style={{
                //@ts-ignore
                "--top":
                  ((top + bottom) / 2 / window.innerHeight * 100) + "%",
                //@ts-ignore
                "--left":
                  ((right + left) / 2 / window.innerWidth * 100) + "%",
                //@ts-ignore
                "--scale":
                  window.innerWidth /
                  ((imageRef.current?.getBoundingClientRect().right || 1) -
                    (imageRef.current?.getBoundingClientRect().left || 0)) * 0.8,

                willChange: "scroll-position",
              }}
            />
            {current && (
              <div className="absolute top-2 right-2 bg-focus rounded-full w-2 h-2"></div>
            )}
            {tab.position.pinned && (
              <button
                onClick={(e) => e.stopPropagation()}
                className="active:bg-gray-100 p-1 absolute top-1 left-1 z-50 rounded-sm"
              >
                <LockClosedIcon className="text-gray-900 rounded-full w-3 h-3"></LockClosedIcon>
              </button>
            )}
            <div className="absolute inset-0 rounded-md border border-gray-300 dark:border-gray-100 sortable-drag:border-gray-400"></div>
            <div className="absolute inset-0 rounded-md shadow-md opacity-30"></div>
            <div className={`absolute inset-0 rounded-md bg-black sortable-drag:invisible ${press ? "opacity-20" : "opacity-0 delay-150"} transition-opacity duration-[50ms]`}></div>
            <MultiSelectionDragOverlay />
          </div>
          <div className="relative mt-2">
            <div className="flex flex-row gap-x-2 items-center px-[0.125rem] sortable-drag:hidden sortable-group-drag:flex">
              {tab.metadata.favIconUrl && (
                <img
                  src={tab.metadata.favIconUrl}
                  className="mt-[.25rem] w-[1.125rem] h-[1.125rem] rounded-sm "
                ></img>
              )}
              {!tab.metadata.favIconUrl &&
                !tab.metadata.url &&
                !tab.isNewTabPage && (
                  <CogIcon
                    className={`mt-[.25rem] w-[1.125rem] h-[1.125rem] rounded-sm text-focus`}
                  />
                )}
              {!tab.metadata.favIconUrl &&
                !tab.metadata.url &&
                tab.isNewTabPage && (
                  <ChromeIcon
                    className={`mt-[.25rem] w-4 h-4 rounded-sm text-gray-800`}
                  />
                )}
              {!tab.metadata.favIconUrl && tab.metadata.url && (
                <WorldIcon className="mt-[.25rem] w-[1.125rem] h-[1.125rem] rounded-sm text-gray-800" />
              )}
              <span className="flex-1 text-ellipsis whitespace-nowrap overflow-hidden text-[0.9rem] antialiased text-gray-900">
                {!tab.metadata.url && (tab.isNewTabPage ? "New Tab" : "Chrome")}
                {tab.metadata.title}
              </span>
            </div>
            <div className="opacity-0 hover:opacity-100 transition-opacity absolute right-0 top-0 bottom-0 flex flex-row items-center pl-6 bg-gradient-to-r from-transparent via-background to-background sortable-drag:hidden sortable-selected:via-highlight sortable-selected:to-highlight">
              <button
                className="rounded-full p-1 tab-x-button active:bg-gray-100 sortable-selected:active:bg-focus"
                onClick={(e) => {
                  e.stopPropagation();
                  chrome.tabs.remove(tab.chromeId);
                }}
              >
                <XIcon className="w-3.5 h-3.5 text-gray-800"></XIcon>
              </button>
            </div>
          </div>
        </div>
      </OverviewTabContextMenu>
    </div>
  );
};

export const MultiSelectionDragOverlay: React.FC<{}> = ({ }) => {
  const selection = useTabSelection();

  if (selection.length === 0) return <></>;
  else
    return (
      <>
        <div className="absolute inset-0 bg-focus opacity-30  rounded-md invisible sortable-group-drag:visible"></div>
        <div className="absolute inset-0 rounded-md invisible sortable-group-drag:visible grid place-items-center">
          <div className="text-focus text-xl">
            {selection.length} tab{selection.length > 1 ? "s" : ""}
          </div>
        </div>
      </>
    );
};
