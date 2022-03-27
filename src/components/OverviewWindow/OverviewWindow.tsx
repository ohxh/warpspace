import { CogIcon, DocumentTextIcon, DotsHorizontalIcon, PlusIcon, StarIcon, XIcon } from "@heroicons/react/outline";
import { StarIcon as StarIconFilled } from "@heroicons/react/solid";
import { useDebounce } from "@react-hook/debounce";
import React, { useState } from "react";
import Sortable, { MultiDrag } from "sortablejs";
import { db } from "../../services/Database";
import { HydratedWindow } from "../../services/TabStore";
import { LocalStorageImage } from "../LocalStorageImage";
import { ChromeIcon } from "../Window/ChromeIcon";
import { EditableText } from "../Window/EditableText";
import { WorldIcon } from "../Window/WorldIcon";
import "./tab-grid.css";

Sortable.mount(new MultiDrag())

export const StarIcon2: React.FC<{}> = ({ }) => {
  const [ticked, setTicked] = useState(false)

  const [pinging, setPinging, setPingingImmediate] = useDebounce(false, 1000)
  const tick = () => {
    setTicked(true)
    setPinging(false)
    setPingingImmediate(true)
  }
  return <button onClick={() => { if (ticked) setTicked(!ticked); else tick(); }} className="relative px-1 py-1 rounded-sm active:bg-gray-100">
    {!ticked && <StarIcon className="w-4 h-4 text-gray-500" />}
    {ticked && <StarIconFilled className="w-4 h-4 text-yellow" />}
    {pinging && <div className="absolute inset-0 p-1"><StarIconFilled className="m-auto w-h h-5 text-yellow animate-ping" /></div>}
  </button>
}



export const OverviewWindow: React.FC<{ data: HydratedWindow }> = ({ data, children }) => {

  const [overrideTitle, setOVerrideTitleDebounce, setOverrideTitle,] = useDebounce<string | null>(data.type === "full" ? data.title : "", 500)
  const setTitle = (x: string | undefined) => {
    setOverrideTitle(x || "")
    setOVerrideTitleDebounce(null)
    db.windows.update(data.id, {
      type: "full",
      title: x
    })
  }

  return <div
    // `window` class adds complicated styling from window.css to deal with
    // consistent tab sizes, as determined by the window grid and elsewhere
    className="snap-center window mt-8">
    <div className="pb-10 flex items-baseline space-x-4"
      onKeyDown={e => {
        if (e.key == "ArrowDown") {
          (document.querySelector(`[data-tab-id="${data.tabs[0].id}"]`) as HTMLElement)?.focus()
          e.stopPropagation();
        }
      }}
    >
      <EditableText placeholder="Untitled space"
        id={`window-title-${data.id}`}
        value={
          overrideTitle === null ?
            (data.type === "full" ? data.title : undefined) : overrideTitle} onChange={setTitle} />
      {/* : <h1 className="text-4xl text-gray-400 ">Unnamed Window</h1>} */}
      <div className="flex-1" />
      <div className="group text-[15px] text-gray-600 transition-opacity  flex items-center">

        <button className="px-1 py-1 rounded-sm active:bg-gray-100"><DotsHorizontalIcon className="w-4 h-4 text-gray-500" /></button>
        <StarIcon2 />
        <button className="px-1 py-1 rounded-sm active:bg-gray-100"
          onClick={() => chrome.windows.remove(data.chromeId)}
        ><XIcon className="w-4 h-4 text-gray-500" /></button>
      </div>

    </div>


    {children}


    <div className="flex pt-6 space-x-4 w-full border-t">
      <button
        className="block tab focus:ring-3 ring-focus ring-offset-2 rounded-md focus:outline-none"
        id={`window-newtab-${data.id}`}
        onClick={() => {
          chrome.tabs.create({ active: true, windowId: data.chromeId });
          chrome.windows.update(data.chromeId, { focused: true });
        }}

      >
        <div
          className={`aspect-[16/9] w-full border border-dashed border-gray-300 rounded-md flex hover:bg-gray-100`}
          style={{ borderStyle: "d" }}
        >
          <div className="m-auto text-gray-600 items-center flex flex-col">
            <PlusIcon className="w-5 h-5 mb-2" />
            New tab
          </div>
        </div>
      </button>
      <button
        className="block tab focus:ring-3 ring-focus ring-offset-2 rounded-md focus:outline-none"
        id={`window-newnote-${data.id}`}
        onClick={() => {
          chrome.tabs.create({
            active: true,
            windowId: data.chromeId,
            url: chrome.runtime.getURL("/notes.html"),
          });
          chrome.windows.update(data.chromeId, { focused: true });
        }}
      >
        <div
          className={`aspect-[16/9] w-full border border-dashed border-gray-300 rounded-md flex hover:bg-gray-100`}
          style={{ borderStyle: "d" }}
        >
          <div className="m-auto text-gray-600 items-center flex flex-col">
            <DocumentTextIcon className="w-5 h-5 mb-2" />
            New note
          </div>
        </div>
      </button>
    </div>

    <div className="mt-20 relative w-full flex-row items-stretch flex">
      <div className="flex flex-row-reverse -mr-5">
        <div className="tab"></div>
        {data.tabs.slice(0, 3).map((tab, index) => {
          return <div className={`flex flex-col  w-5`}
            style={{ transform: `scale(${1 - .03 * (2 - index)})` }}
          >
            <div className="tab cursor-pointer group-active:opacity-80">
              <LocalStorageImage srcKey={tab.crawl.lod === 1 ? (tab.crawl.previewImage || "none") : "none2"} alt="" className={`shadow-lg bg-gray-100 aspect-[16/9] w-full border border-gray-300 rounded-md  object-cover`} />
            </div>
          </div>
        })}
      </div>
      <div className="flex flex-col items-start ml-3">

        <div className="text-lg antialiased text-gray-400">Untitled Window</div>
        <div className="flex flex-row gap-1 mt-1">
          {data.tabs.slice(0, 6).map(tab => <div className="flex flex-row gap-x-2 items-center px-[0.125rem] sortable-drag:hidden sortable-group-drag:flex">
            {tab.metadata.favIconUrl && (
              <img
                src={tab.metadata.favIconUrl}
                className="mt-[.0625rem] w-[1.125rem] h-[1.125rem] rounded-sm "
              ></img>
            )}
            {!tab.metadata.favIconUrl &&
              !tab.metadata.url &&
              !tab.isNewTabPage && (
                <CogIcon
                  className={`mt-[.0625rem] w-[1.125rem] h-[1.125rem] rounded-sm text-focus`}
                />
              )}
            {!tab.metadata.favIconUrl &&
              !tab.metadata.url &&
              tab.isNewTabPage && (
                <ChromeIcon
                  className={`mt-[.0625rem] w-4 h-4 rounded-sm text-gray-800`}
                />
              )}
            {!tab.metadata.favIconUrl && tab.metadata.url && (
              <WorldIcon className="mt-[.0625rem] w-[1.125rem] h-[1.125rem] rounded-sm text-gray-800" />
            )}
            {/* {index === 2 && <span className="flex-1">+ 5 more tabs</span>} */}
          </div>)}
          <div className="text-gray-700 ml-2">+ 5</div>
        </div>

      </div>
    </div>


  </div >
}