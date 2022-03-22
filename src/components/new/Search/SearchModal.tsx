
import { SearchIcon } from "@heroicons/react/solid";
import { useDebounce } from "@react-hook/debounce";
import { set } from "immer/dist/internal";
import React, { useState } from "react";
import { useAsync } from "react-async-hook";
import { ActiveVisit, Page } from "../../../services/Database";
import { parseQuery } from "../../../services/search/Search";
import { SearchResult, ShortSearchResult } from "../../Search/SearchResult";
import { SearchBox } from "./SearchBox";

const search = (x: string) => new Promise<ActiveVisit[]>(resolve => {
  chrome.runtime.sendMessage({ event: "request-search", data: x }, (response) => {
    resolve(response)
  })
});


export const SearchModal: React.FC<{
  onClose: () => void
}> = ({ onClose }) => {


  return <div className="fixed inset-0 z-50 bg-[#333] bg-opacity-30" onClick={onClose} onKeyDown={(e) => {
    if (e.key === "Escape") onClose()
  }}>
    <div className="mt-[10vh] mx-auto w-1/2 min-w-[48rem] z-5">
      <SearchBox />
    </div>
  </div>
}