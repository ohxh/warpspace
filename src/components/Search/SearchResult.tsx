import React from "react";
import { ActiveVisit } from "../../services/Database";
import { LocalStorageImage } from "../LocalStorageImage";



export const SearchResult: React.FC<{ tab: ActiveVisit }> = ({ tab }) => {
  return <>
    <div className="flex gap-x-4 group w-full px-4 py-2 max-w-full">
      <div>
        <div className="tab cursor-pointer group-active:opacity-80">
          <LocalStorageImage srcKey={tab.crawl.lod === 1 ? (tab.crawl.previewImage || "none") : "none2"} alt="" className={`bg-gray-100 aspect-[16/9] w-full border border-gray-300 rounded-md  object-cover`} />
        </div>
      </div>

      <div className="flex-1 items-stretch min-w-0">

        <div className="flex flex-row gap-x-2 items-center">
          {tab.metadata.favIconUrl && <img src={tab.metadata.favIconUrl} alt="hi" className="w-4 h-4 rounded-sm"></img>}
          <span className="flex-1 text-ellipsis whitespace-nowrap overflow-hidden text-lg antialiased group-hover:underline" >
            {tab.metadata.title ?? "New Tab"}
          </span>
        </div>
        <div className="text-sm text-gray-500 mb-1 text-ellipsis whitespace-nowrap overflow-hidden">{tab.url}</div>
        <p className="text-gray-700 text-sm max-lines-2 overflow-hidden">
          Lorem ipsum dolor sit amet, <b>consectetur adipiscing elit</b>, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    </div>
  </>
}



export const ShortSearchResult: React.FC<{ tab: ActiveVisit }> = ({ tab }) => {
  return <>
    <div className="flex gap-x-4 group w-full px-4 py-2 max-w-full items-center">
      {tab.metadata.favIconUrl && <img src={tab.metadata.favIconUrl} alt="hi" className="w-4 h-4 rounded-sm"></img>}
      <span className="flex-1 text-ellipsis whitespace-nowrap overflow-hidden text-[15px] antialiased" >

        <span className=" group-hover:underline">{tab.metadata.title ?? "New Tab"}</span>&nbsp;-&nbsp;<span className="text-gray-500">https://news.ycombinator.com/</span>
      </span>
    </div>
  </>
}

