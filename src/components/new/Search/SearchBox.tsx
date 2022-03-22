
import { SearchIcon } from "@heroicons/react/solid";
import { useDebounce } from "@react-hook/debounce";
import { set } from "immer/dist/internal";
import React, { useEffect, useRef, useState } from "react";
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

  const lastResults = useRef(results);

  const [highlightedIndex, setHighlightedIndex] = useState(0);

  return <Flipper
    // flipKey={results.result?.length === 0 ? lastResults.current.result : results.result}
    flipKey={results}
    spring={{
      stiffness: 7000,
      damping: 200
    }}
  >
    <div className="h-2 border-t border-r border-l border-gray-300 rounded-t-lg bg-background"></div>
    <Flipped flipId={"content"} >
      <div className={`z-40 bg-background relative border-r border-l border-gray-300 ${open ? "shadow-xl" : "shadow-none"} transition-shadow overflow-clip`}

      >
        <Flipped inverseFlipId={"content"} scale >
          <div>
            <div className="w-full flex flex-row items-center px-6 pl-4 py-2 space-x-4">
              <input
                autoFocus
                onFocus={() => setOpen(true)}
                onBlur={() => {
                  if (query.length === 0)
                    setOpen(false)
                }}
                onKeyDown={(k) => {
                  if (k.key === "ArrowUp" && results.result && highlightedIndex > 0) {
                    setHighlightedIndex(x => x - 1)
                    k.preventDefault()
                  }

                  if (k.key === "ArrowDown" && results.result && highlightedIndex < results.result?.length - 1) {
                    setHighlightedIndex(x => x + 1)
                    k.preventDefault()
                  }

                  if (k.key === "Enter" && results.result) {

                    if (results.result[highlightedIndex].status === "active") {
                      chrome.tabs.update(results.result[highlightedIndex].chromeId, { active: true })
                    }
                    else chrome.tabs.create({
                      url:
                        results.result[highlightedIndex].metadata.url,
                      active: true
                    })
                    k.preventDefault()
                  }
                }}
                onChange={e => {
                  setQuery(e.target.value)
                }} className="flex-1 text-lg text-gray-900 placeholder:text-gray-500 w-full h-full focus:outline-none" placeholder="Search or jump to..." />
              {results.loading && false && <svg className="animate-spin h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>}
              <SearchIcon className="w-4 h-4 text-gray-500" />
            </div>
            {/* {results.loading && <div className="w-20 h-20 bg-purple"></div>} */}
            {query && !!results?.result?.length &&
              <div >
                <div className="px-4 text-small text-gray-700 py-2">Type <kbd>{'>'}</kbd> for commands and ? for help</div>
                {/* {JSON.stringify(parseQuery(query))} */}
                {query === "?" && <div>
                  <div className="text-sm">
                    <kbd>is:open</kbd> Checks if it's open
                  </div>
                </div>}
                {query !== "?" && !!results?.result?.length &&
                  <div className="w-full pb-1">
                    {results.result.filter(x => x.status === "active").slice(0, 8).map((r, i) => {
                      if (i < 2) return <SearchResult tab={r as ActiveVisit} highlighted={highlightedIndex === i} />
                      else return <ShortSearchResult tab={r as ActiveVisit} highlighted={highlightedIndex === i} />
                    })}

                  </div>}
              </div>}
          </div>
        </Flipped>
      </div>
    </Flipped>
    <Flipped flipId={"bottom"}>
      <div className="h-2 border-b border-r border-l border-gray-300 rounded-b-lg z-40 relative bg-background"></div>
    </Flipped>
  </Flipper>
}