import { ArrowLeftIcon, ClockIcon } from "@heroicons/react/20/solid";
import { KBarResults, KBarSearch, VisualState, useKBar } from "kbar";
import { useOuterClick } from "kbar/lib/utils";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { useSetting } from "../../hooks/useSetting";
import { BaseSearchActionResult, PageSearchActionResult, SearchActionResult } from "../../services/search/results";
import { SearchFunction, rootSearch } from "../../services/search/search";
import { Favicon, SmartFavicon } from "../primitives/Favicon";
import { KeyCap } from "../primitives/KeyCap";
import { WarpspaceIcon } from "../primitives/icons/warpspace";
import { SettingsModalInner } from "../settings/SettingsModal";
import { DateVisitedDropdown } from "./DateVisitedDropdown";
import { ItemTypeDropdown } from "./ItemTypeDropdown";
import { SearchContextChip } from "./SearchContextChip";
import { SearchResult, SearchSectionHeading } from "./SearchResult";
import { SortOrderDropdown } from "./SortOrderDropdown";
import { TabPreview } from "./previews/TabPreview";
import { highlightChildren } from "./previews/highlightChildren";

import { useLiveQuery } from "dexie-react-hooks";
import { OpenVisit, TrackedWindow, db } from "../../services/database/DatabaseSchema";
import { CursorIcon } from "../primitives/icons/cursor";
import { PageSearchPreview } from "./previews/PageSearchPreview";
import { Toaster, ToastBar } from "react-hot-toast";
import { appSettingsContext, getLiveSettings } from "../../services/settings/WarpspaceSettingsContext";
import { humanReadableTimeAgo } from "../../utils/time";
import { makeSelectionSearch } from "../../services/search/nested/makeSelectionSearch";
import { WindowSearchPreview } from "./previews/WindowSearchPreview";





interface KBarAnimatorProps {
  style?: React.CSSProperties;
  className?: string;
}

const appearanceAnimationKeyframes = [
  {
    opacity: 0,
    transform: "scale(.99)",
  },
  { opacity: 1, transform: "scale(1.01)" },
  { opacity: 1, transform: "scale(1)" },
];

const bumpAnimationKeyframes = [
  {
    transform: "scale(1)",
  },
  {
    transform: "scale(.99)",
  },
  {
    transform: "scale(1)",
  },
];

export const SearchBarAnimator: React.FC<
  React.PropsWithChildren<KBarAnimatorProps & { root: any }>
> = ({ children, style, className, root }) => {
  const { visualState, currentRootActionId, query, options } = useKBar(
    (state) => ({
      visualState: state.visualState,
      currentRootActionId: state.currentRootActionId,
    })
  );

  const animations = useSetting("appearance.animations");

  const outerRef = React.useRef<HTMLDivElement>(null);
  const innerRef = React.useRef<HTMLDivElement>(null);

  const enterMs = options?.animations?.enterMs || 0;
  const exitMs = options?.animations?.exitMs || 0;

  // Show/hide animation
  React.useEffect(() => {
    const element = outerRef.current;
    if (visualState === VisualState.showing) {
      return;
    }

    const duration = visualState === VisualState.animatingOut ? exitMs : enterMs;



    if (visualState === VisualState.animatingOut) {
      element?.animate(appearanceAnimationKeyframes, {
        duration,
        easing: "ease-in",
        direction: "reverse",
        fill: "forwards",
      });
    }
    // element?.animate(appearanceAnimationKeyframes, {
    //   duration: animations === "none" ? 0 : duration,
    //   easing:
    //     // TODO: expose easing in options
    //     visualState === VisualState.animatingOut ? "ease-in" : "ease-out",
    //   direction:
    //     visualState === VisualState.animatingOut ? "reverse" : "normal",
    //   fill: "forwards",
    // });
  }, [options, visualState, enterMs, exitMs, animations]);

  // Height animation
  const previousHeight = React.useRef<number>();
  React.useEffect(() => {
    // Only animate if we're actually showing
    if (visualState === VisualState.showing) {
      const outer = outerRef.current;
      const inner = innerRef.current;

      if (!outer || !inner) {
        return;
      }

      const ro = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const cr = entry.contentRect;

          if (!previousHeight.current) {
            previousHeight.current = cr.height;
          }


          outer.animate(
            [
              {
                height: `${previousHeight.current}px`,
              },
              {
                height: `${cr.height}px`,
              },
            ],
            {
              duration: animations === "none" ? 0 : exitMs / 2,
              // TODO: expose configs here
              easing: "ease-out",
              fill: "forwards",
            }
          );
          previousHeight.current = cr.height;
        }
      });

      ro.observe(inner);
      return () => {
        ro.unobserve(inner);
      };
    }
  }, [visualState, options, enterMs, exitMs, animations]);

  // Bump animation between nested actions
  const firstRender = React.useRef(true);


  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const element = outerRef.current;
    if (element && animations === "smooth") {
      element.animate(bumpAnimationKeyframes, {
        duration: enterMs,
        easing: "ease-out",
      });
    }
  }, [root, enterMs, animations]);

  useOuterClick(outerRef, () => {
    query.setVisualState(VisualState.animatingOut);
    options.callbacks?.onClose?.();
  });

  return (
    <div
      ref={outerRef}
      style={{
        // ...appearanceAnimationKeyframes[0],
        ...style,
        pointerEvents: "auto",
        transformOrigin: useSetting("appearance.position") === "top" ? "top" : "center"
      }}
      className={className}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
};

export type SelectionContext = {
  selection: SearchActionResult[],
  children: SearchFunction,
  title: "selection",
  type: "selection",
  placeholder: string,
  hidePreviewPanel: boolean,
  perform?: any,
}

export const SearchBarModal: React.FC<{ open?: boolean; subtle?: boolean }> = ({ subtle }) => {


  // const global = useLiveQuery(() => db.global.get("global"));
  const global = true;

  const { queryText, activeIndex, query } = useKBar((state) => ({
    queryText: state.searchQuery,
    activeIndex: state.activeIndex,
  }));
  useEffect(() => {
    query.setSearch(((document.getElementById("input") as HTMLInputElement)?.value || "") + queryText)
  }, [])



  const exclusions = useSetting("privacy.exclusions")
  const [settings] = useContext(appSettingsContext)

  const [lastResolvedQueryText, setLastResolvedQueryText] = useState("");
  const [lastResolvedExclusions, setLastResolvedExclusions] = useState(exclusions.length);
  const [lastResolvedContext, setLastResolvedContext] = useState(0);
  const [items, setItems] = useState<(string | SearchActionResult)[]>([])
  const [context, setContext] = useState<(SearchActionResult | SelectionContext)[]>([])
  const [selection, setSelection] = useState<(SearchActionResult)[]>([])
  const [loading, setLoading] = useState(false)
  const searchedOnce = useRef(false)


  let searcher = context[context.length - 1] ? context[context.length - 1].children : rootSearch

  useEffect(() => {
    const t0 = performance.now()
    searcher!(queryText).then((t: any) => {
      console.log(`Searched for "${queryText}" in ${performance.now() - t0}ms and got ${t?.length} results:`, t)
      console.log("Exlusions", exclusions)
      const tt = t.filter((x: any) => !exclusions.includes(x.url))
      setItems(tt ?? [])
      setLastResolvedQueryText(queryText)
      setLastResolvedContext(context.length)
      setLastResolvedExclusions(exclusions.length)
      setLoading(false)
      setTime(performance.now() - t0)
    })
  }, [])

  let [time, setTime] = useState(0);

  useEffect(() => {
    if (queryText === lastResolvedQueryText && context.length == lastResolvedContext && exclusions.length === lastResolvedExclusions) return;
    // if (queryText === lastResolvedQueryText && queryText !== "") return;
    if (loading) return;

    console.log("useEffect", queryText, lastResolvedQueryText)
    let searcher = context[context.length - 1] ? context[context.length - 1].children : rootSearch

    setLoading(true);
    if (!searcher) {
      setItems([])
      setLoading(false)
    }
    else {
      const t0 = performance.now();

      searcher!(queryText).then((t: any) => {
        console.log(`Searched for "${queryText}" in ${performance.now() - t0}ms and got ${t?.length} results:`, t)
        console.log("Exlusions", exclusions)
        const tt = t.filter((x: any) => !exclusions.includes(x.url))
        setItems(tt ?? [])
        setLastResolvedQueryText(queryText)
        setLastResolvedContext(context.length)
        setLastResolvedExclusions(exclusions.length)
        setLoading(false)
        setTime(performance.now() - t0)
      })
    }
  }, [queryText, lastResolvedQueryText, context, lastResolvedContext, setItems, loading, exclusions])

  const settingsOpen = context[0]?.title === "Settings"

  const showDebug = useSetting("developer.showSearchRankingReasons");

  if (queryText && !loading) searchedOnce.current = true;

  const previewScrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    previewScrollRef.current?.scrollTo({ top: 0 })
  }, [activeIndex, query])


  // Callbacks: 

  const open = useCallback(async () => {
    setLoading(true)

    const current = items[activeIndex] as SearchActionResult

    let result = await current.perform!();
    if (result) {
      setContext(result)
      query.setActiveIndex(0)
      query.setSearch("")
      setLoading(false)
    } else {
      window.top!.postMessage(
        { event: "exit-search" },
        { targetOrigin: "*" }
      );
    }
  }, [items, activeIndex, setContext, query,])

  const popContext = useCallback(() => {
    if (context.length > 0) {
      setContext(context.slice(0, -1))
    } else {
      setSelection([])
    }
  }, [context, setContext, setSelection])

  const pushContext = useCallback(() => {
    let current = items[activeIndex] as SearchActionResult;
    const t0 = performance.now()
    setLoading(true)

    current.children!("").then((t: any) => {
      setItems(t ?? [])
      query.setSearch("");
      setLastResolvedQueryText("")
      setLastResolvedContext(context.length + 1)
      setContext([...context, current as SearchActionResult])

      setTimeout(() => {
        setLoading(false)
      }, 1)

      setTime(performance.now() - t0)
    });
  }, [setTime, setLastResolvedContext, setLastResolvedQueryText, setContext, setLoading, items, activeIndex])

  const pushSelectionToContext = useCallback(() => {

  }, [])

  const toggleSelection = useCallback(() => {
    let current = items[activeIndex] as SearchActionResult
    if (selection.some(c => c.id === current.id)) {
      setSelection(selection.filter(c => c.id !== current.id))
    } else {
      setSelection(c => [...c, items[activeIndex] as SearchActionResult])
    }
  }, [items, activeIndex, setSelection, selection])

  return <SearchBarAnimator
    root={context[context.length - 1]}
    style={{
      position: !subtle && useSetting("appearance.position") === "top" ? "fixed" : undefined,
      top: !subtle && useSetting("appearance.position") === "top" ? 0 : undefined,
      maxWidth: useSetting("appearance.width") === "wide" ? "72rem" : "56rem"
    }}
    className={`w-full bg-ramp-0 dark:bg-ramp-100 ring-1 ring-black/5 dark:ring-0 dark:border border-ramp-200 ${!subtle && useSetting("appearance.position") === "top" ? "rounded-b-md" : "rounded-md"} ${subtle ? "shadow-lg" : "shadow-2xl"} overflow-hidden`}>
    <Toaster
      toastOptions={{
        className: "bg-black/80 text-white rounded-md p-2"
      }}
      position="bottom-center"

    >
      {(t) => (

        <ToastBar
          toast={t}
          style={{
            ...t.style,
            animation: t.visible ? 'fadeIn .15s forwards' : 'fadeOut .15s forwards',
          }}
        />

      )}
    </Toaster>

    {settingsOpen && <div className="h-[448px]">
      <MemoryRouter><SettingsModalInner returnButton={
        <button onClick={() => setContext([])} className="px-4 py-1.5 text-left hover:bg-ramp-100 dark:hover:bg-ramp-200 bg-ramp-0 dark:bg-ramp-100 relative pl-10 flex flex-row items-center">
          <ArrowLeftIcon className="w-4 h-4 absolute left-3" />
          Back to search
        </button>
      } /></MemoryRouter>
    </div>}
    <div className="relative flex flex-row items-center px-4 gap-x-2" style={{ display: settingsOpen ? "none" : "" }}>


      {context.map(c => <SearchContextChip item={c} key={c.title} />)}
      {!!selection.length && <div className="bg-highlightFaint rounded-md px-2 py-1 flex flex-row gap-x-3">
        {selection.slice(0, 5).map((s, i) => <Favicon url={s?.url || ""} />)}
        {selection.length == 1 && <>1 tab</>}
        {selection.length > 1 && <>{selection.length} tabs</>}
      </div>}
      <KBarSearch
        defaultPlaceholder={context[context.length - 1]?.placeholder}
        className="flex-1 text-base text-ramp-900 py-3 w-full outline-none"
        onKeyDown={async e => {
          const current = items[activeIndex] as SearchActionResult

          if (e.key === "Backspace" && (e.target as HTMLInputElement).value.length === 0) {
            popContext()
          } else if (e.key === "Tab") {
            // Push the highlighted result on to the context if possible
            e.preventDefault()
            e.stopPropagation()

            // If shift-tab or tab on selected
            if (selection.length > 0 && e.shiftKey || selection.some(c => c.id === current.id)) {
              setContext([...context, {
                type: "selection",
                children: makeSelectionSearch(selection as PageSearchActionResult[]),
                hidePreviewPanel: false,
                placeholder: `Search actions for selection`,
                selection: selection,
                title: "selection",
              }])
              setSelection([])
              query.setSearch("");

              return
            }

            if (typeof current !== "string" && current.children) {
              pushContext()
            }
          } else if (e.key === "Enter") {
            e.preventDefault()
            e.stopPropagation()

            if (e.shiftKey && typeof items[activeIndex] === "object") {
              toggleSelection()
              return
            }

            // If the highlighted result has an action, do it and reset state
            if (typeof current !== "string" && current.perform) {
              open()
            } else if (typeof current !== "string" && current.children) {
              // Otherwise, try to push the highlighted result to the context
              // This gives natural behavior if the user hits enter instead of tab
              pushContext()
              // const t0 = performance.now()
              // current.children!("").then((t: any) => {
              //   setLoading(true)
              //   setItems(t ?? [])
              //   setLastResolvedQueryText("")
              //   setLastResolvedContext(context.length)
              //   query.setActiveIndex(0)

              //   setContext([...context, current as SearchActionResult])
              //   query.setSearch("");
              //   setLoading(false)
              //   setTime(performance.now() - t0)
              // });
            }
          }
        }}
      />
      <div className="absolute top-0 bottom-0 right-4 flex items-center">

        <WarpspaceIcon className={loading ? "animate-pulse" : ""} />
      </div>
    </div>
    <div className="w-full px-4 pt-0 flex flex-row gap-x-2 items-center transition-[height] min-h-0 overflow-hidden" style={{ height: (context.length === 0) ? "3em" : "0px" }}>
      <div className="flex-1 text-left"><KeyCap>↑</KeyCap> <KeyCap>↓</KeyCap> to focus, <KeyCap>?</KeyCap> for help</div>
      <SortOrderDropdown sortOrder="relevance" setSortOrder={() => { }} />
      <DateVisitedDropdown />
      <ItemTypeDropdown />
    </div>
    {/* <SearchHelpBar /> */}
    {/* 
    <div className="w-full flex flex-row items-center px-4 py-2 gap-x-2">
      <div className="rounded border border-ramp-500 px-2 py-1">Code</div>
      <div className="rounded border border-ramp-500 px-2 py-1">Page</div>
      <div className="rounded border border-ramp-500 px-2 py-1">Title</div>
      <div className="rounded border border-ramp-500 px-2 py-1">Link</div>
    </div> */}

    {global &&
      <div className="border-t border-ramp-200">
        {items.length > 0 &&
          <div className="flex flex-row" style={{ display: (settingsOpen) ? "none" : "" }}>
            <div className="flex-[4] relative">
              {/* <div className="text-xs text-ramp-500 absolute right-4 top-2">
                {items.length} results in {time.toFixed(2)}ms
              </div> */}
              <RenderResults
                effectiveQuery={lastResolvedContext}
                effectiveContext={lastResolvedQueryText}
                items={items}
                selection={selection}
                toggleSelection={toggleSelection}
                pushContext={pushContext}
                setContext={setContext}
              />
            </div>
            {items[activeIndex] && !(context.length && context[context.length - 1].hidePreviewPanel) &&
              <div className="self-stretch flex-[3] min-w-0  pb-10 border-l border-ramp-200 relative max-h-[400px] h-[400px]">
                {/* <ScoreExplanation item={items[activeIndex] as ActionableRankedResult} /> */}
                <div className="overflow-y-scroll absolute inset-0 pb-16" ref={previewScrollRef}>
                  <SearchPreview result={items[activeIndex] as SearchActionResult} key="preview" />
                </div>

                <div className="overflow-hidden whitespace-nowrap text-ramp-700 text-sm p-4 pt-10 pb-3 bg-gradient-to-b from-transparent via-ramp-0 to-ramp-0 dark:via-ramp-100 dark:to-ramp-100 absolute bottom-0 left-0 right-0 flex flex-col gap-y-1">
                  {/* <div>
                    <KeyCap>Shift</KeyCap><KeyCap>Enter</KeyCap> to select,
                  </div> */}
                  <div className="flex flex-col items-start gap-y-2">
                    {/* @ts-ignore */}
                    {/* {selection.length > 0 && !selection.some(s => s.id === items[activeIndex].id) &&
                      <><KeyCap>Enter</KeyCap> to select, <KeyCap>Tab</KeyCap> to see selection actions
                      </>} */}


                    {/* @ts-ignore */}
                    {
                      <div>
                        <KeyCap>Enter</KeyCap> to open
                        {(items[activeIndex] as any)?.children && <>, <KeyCap>Tab</KeyCap> to search within</>}
                      </div>}
                    {/* @ts-ignore */}
                    {selection.length > 0 && selection.some(s => s.id === items[activeIndex].id) &&
                      <div className="bg-highlightFaint  pl-1 -ml-1 px-2 py-1 -mx-2 -my-1 rounded"><KeyCap>Shift</KeyCap><KeyCap>Enter</KeyCap> to deselect, <KeyCap>Shift</KeyCap><KeyCap>Tab</KeyCap> to see actions
                      </div>}
                  </div>
                </div>

                {/* @ts-ignore */}
                {showDebug && items[activeIndex].debug &&
                  <pre className="right-4 top-4 absolute rounded hover:rounded-none group text-white bg-black/70  h-min w-min font-mono hover:top-0 hover:right-0 hover:h-full hover:w-full hover:z-10 text-xs">
                    <div className="group-hover:hidden z-50  flex flex-row gap-x-2 items-center p-1">
                      info
                    </div>
                    <div className="group-hover:block hidden px-4 py-2" > {/* @ts-ignore */}
                      {JSON.stringify(items[activeIndex].debug, null, 2)}
                    </div>
                  </pre>}
              </div>}
          </div>}



        {items.length === 0 && (queryText.length > 0 || loading) && searchedOnce.current &&
          <div className="select-none text-center w-full text-sm text-ramp-500 py-10 h-[400px] " style={{ display: (settingsOpen) ? "none" : "" }}>
            No results found.

          </div>}
      </div>
    }

    {
      !global && queryText.length > 0 &&
      <div className="border-t border-ramp-200 h-96">
        <div className="select-none text-center w-full text-sm text-ramp-500 py-10 " style={{ display: (settingsOpen) ? "none" : "" }}>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-focus" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            {/* <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> */}
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Indexing...
        </div>
      </div>
    }

  </SearchBarAnimator >
  {/* </KBarPositioner> */ }
  {/* </KBarPortal> */ }
}


const RenderResults = RenderResultsInner
function RenderResultsInner(props: { items: any[], effectiveQuery: any, effectiveContext: any, selection: any, toggleSelection: any, pushContext: any, setContext: any }) {

  return (
    <KBarResults
      items={props.items}
      onRender={({ item, active }: any) =>
        <div onClick={async (e) => {
          if (e.shiftKey || e.metaKey || e.ctrlKey) {
            e.stopPropagation()
            e.preventDefault()
            props.toggleSelection()
          } else if (item.perform) {
            const newContext = await item.perform()
            props.setContext(newContext)
          } else if (item.children) {
            props.pushContext()
          }
        }}>{
            typeof item === "string" ?
              <SearchSectionHeading title={item} />
              :
              <SearchResult item={item} active={active} selected={props.selection.some((s: any) => s.id === item.id)} />
          }
        </div>
      }
    />
  );
}

export const ScoreExplanation: React.FC<{ item?: BaseSearchActionResult }> = ({ item }) => {
  return <div className="m-2 p-2 rounded bg-ramp-100">

  </div>
}


let currentTabId = 0;

chrome.tabs.getCurrent((c) => currentTabId = c!.id!);

const SearchPreview: React.FC<{ result?: SearchActionResult }> = ({ result }) => {
  if (!result) return <>

  </>

  if (result.type === "page") return <PageSearchPreview result={result} />


  if (result.type === "content") return <>
    <div className={`shadow-inner `}>
      {/* @ts-ignore */}
      <VirtualizedPreviewLazy frags={result.allFrags} startIndex={result.index} regex={result.debug.regex} />
    </div>
  </>

  if (result.type === "window") return <div className="px-4 py-4">

    <WindowSearchPreview space={result.item} />
  </div>

  return <>  </>
}

let LazyComponent: any = null

const VirtualizedPreviewLazy: React.FC<{ frags: string[], startIndex: number, regex: RegExp }> = ({ frags, startIndex, regex }) => {
  const [x, setX] = useState(0)
  useEffect(() => {
    if (!LazyComponent)
      import("./previews/SearchPreview").then(r => {
        LazyComponent = r.VirtualizedPreview
        setX(x => x + 1)
      })
  })

  return LazyComponent ? <LazyComponent frags={frags} startIndex={startIndex} regex={regex} /> : <></>
}

