
import { SearchIcon } from "@heroicons/react/solid";
import { useDebounce } from "@react-hook/debounce";
import { set } from "immer/dist/internal";
import React, { useState } from "react";
import { useAsync } from "react-async-hook";
import { ActiveVisit, Page } from "../../../services/Database";
import { parseQuery } from "../../../services/search/Search";
import { SearchResult, ShortSearchResult } from "../../Search/SearchResult";
import "../../Window/window.css"
import "../../OverviewTab/overview-tab.css"
import "../../OverviewWindow/tab-grid.css"
import { Flipped, Flipper } from "react-flip-toolkit";

const search = (x: string) => new Promise<ActiveVisit[]>(resolve => {
  chrome.runtime.sendMessage({ event: "request-search", data: x }, (response) => {
    resolve(response)
  })
});

export const SearchBox: React.FC<{}> = ({ }) => {

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false)
  const results = useAsync(search, [query], {
    setLoading: state => ({ ...state, loading: true }),
  })

  return <Flipper
    flipKey={results}
    spring={{
      stiffness: 10000,
      damping: 200
    }}
  >
    <Flipped flipId={"hi"}>
      <div className={`mt-[10vh] mx-auto w-1/2 min-w-[48rem] rounded-lg z-50 bg-background relative border border-gray-300 ${open ? "shadow-xl" : "shadow-none"} transition-shadow overflow-clip`}>
        <Flipped inverseFlipId={"hi"} scale >
          <div>
            <div className="w-full flex flex-row items-center px-6 pl-4 py-4 space-x-4">
              <input
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onChange={e => {
                  setQuery(e.target.value)
                }} className="flex-1 text-lg text-gray-900 placeholder:text-gray-500 w-full h-full focus:outline-none" placeholder="Search or jump to..." />
              {results.loading && <svg className="animate-spin h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>}
              {!results.loading && <SearchIcon className="w-4 h-4 text-gray-500" />}
            </div>
            {query &&
              <div>
                <div className="px-4 text-small text-gray-700 py-2">Type <kbd>{'>'}</kbd> for commands and ? for help</div>
                {/* {JSON.stringify(parseQuery(query))} */}
                {query === "?" && <div>
                  <div className="text-sm">
                    <kbd>is:open</kbd> Checks if it's open
                  </div>
                </div>}
                {query !== "?" && !!results?.result?.length &&
                  <div className="w-full pb-2">
                    {results.result.filter(x => x.status === "active").slice(0, 2).map(r => <SearchResult tab={r as ActiveVisit} />)}
                    {results.result.filter(x => x.status === "active").slice(2, 6).map(r => <ShortSearchResult tab={r as ActiveVisit} />)}
                  </div>}
              </div>}
          </div>
        </Flipped>
      </div>
    </Flipped>
  </Flipper>
}