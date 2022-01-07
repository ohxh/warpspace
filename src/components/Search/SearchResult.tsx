import React from "react";
import { ActiveVisit } from "../../services/Database";
import { LocalStorageImage } from "../Window/Tab";



export const SearchResult: React.FC<{ tab: ActiveVisit }> = ({ tab }) => {
  return <>
    <button className="flex gap-x-2 group">
      <div>
        <div className="tab cursor-pointer group-active:opacity-80">
          <LocalStorageImage srcKey={tab.crawl.lod === 1 ? (tab.crawl.previewImage || "none") : "none2"} alt="" className={`bg-gray-100 aspect-[16/9] w-full border border-gray-300 rounded-md  object-cover ${tab.state.active ? "zoomout" : ""}`} />
        </div>
        Last active 2 days ago
      </div>

      <div>

        <div className="flex flex-row gap-x-2 items-center">
          {tab.metadata.favIconUrl && <img src={tab.metadata.favIconUrl} alt="hi" className="w-4 h-4 rounded-sm"></img>}
          <span className="flex-1 text-ellipsis whitespace-nowrap overflow-hidden text-lg antialiased group-hover:underline" >
            {tab.metadata.title ?? "New Tab"}
          </span>
        </div>
        <div className="text-sm text-gray-500">https://news.ycombinator.com/</div>
        <p className="text-gray-700 text-sm w-48">
          Lorem ipsum dolor sit amet, <b>consectetur adipiscing elit</b>, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    </button>
  </>
}
