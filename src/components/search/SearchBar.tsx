import { ArrowLeftIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { KBarResults, KBarSearch, useKBar, VisualState } from "kbar";
import { useOuterClick } from "kbar/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { BaseSearchActionResult, SearchActionResult } from "../../services/search/results";
import { search } from "../../services/search/search";
import { SettingsModalInner } from "../settings/SettingsModal";
import { WarpspaceIcon } from "../primitives/icons/warpspace";
import { SearchContextChip } from "./SearchContextChip";
import { SearchResult, SearchSectionHeading } from "./SearchResult";
import { useSetting } from "../../hooks/useSetting";

import { KeyCap } from "../primitives/KeyCap";
import { highlightChildren } from "./previews/highlightChildren";
import { Favicon, SmartFavicon } from "../primitives/Favicon";
import { TabPreview } from "./previews/TabPreview";


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

  const [lastResolvedQueryText, setLastResolvedQueryText] = useState("");
  const [lastResolvedContext, setLastResolvedContext] = useState(0);
  const [items, setItems] = useState<(string | SearchActionResult)[]>([])
  const [context, setContext] = useState<(SearchActionResult)[]>([])
  const [loading, setLoading] = useState(false)
  const searchedOnce = useRef(false)

  let [time, setTime] = useState(0);

  useEffect(() => {
    if (queryText === lastResolvedQueryText && context.length == lastResolvedContext) return;
    if (queryText === lastResolvedQueryText && queryText !== "") return;
    if (loading) return;

    console.log("useEffect", queryText, lastResolvedQueryText)
    let searcher = context[context.length - 1] ? context[context.length - 1].children : search

    setLoading(true);
    if (!searcher) {
      setItems([])
      setLoading(false)
    }
    else {
      const t0 = performance.now();

      searcher!(queryText).then((t: any) => {
        setItems(t ?? [])
        setLastResolvedQueryText(queryText)
        setLastResolvedContext(context.length)
        setLoading(false)
        setTime(performance.now() - t0)
      })
    }

  }, [queryText, lastResolvedQueryText, context, lastResolvedContext, setItems, loading])

  const settingsOpen = context[0]?.title === "Settings"


  const showDebug = useSetting("developer.showSearchRankingReasons");

  if (queryText && !loading) searchedOnce.current = true;

  return <SearchBarAnimator
    root={context[context.length - 1]}
    style={{
      position: !subtle && useSetting("appearance.position") === "top" ? "fixed" : undefined,
      top: !subtle && useSetting("appearance.position") === "top" ? 0 : undefined,
      maxWidth: useSetting("appearance.width") === "wide" ? "72rem" : "56rem"
    }}
    className={`w-full bg-ramp-0 dark:bg-ramp-100 ring-1 ring-black/5 dark:ring-0 dark:border border-ramp-200 ${!subtle && useSetting("appearance.position") === "top" ? "rounded-b-md" : "rounded-md"} ${subtle ? "shadow-lg" : "shadow-2xl"} overflow-hidden`}>
    {settingsOpen && <div>
      <MemoryRouter><SettingsModalInner returnButton={
        <button onClick={() => setContext([])} className="px-4 py-1.5 text-left hover:bg-ramp-100 dark:hover:bg-ramp-200 bg-ramp-0 dark:bg-ramp-100 relative pl-10 flex flex-row items-center">
          <ArrowLeftIcon className="w-4 h-4 absolute left-3" />
          Back to search
        </button>
      } /></MemoryRouter>
    </div>}
    <div className="relative flex flex-row items-center px-4 gap-x-2" style={{ display: settingsOpen ? "none" : "" }}>
      {context.map(c => <SearchContextChip item={c} key={c.title} />)}
      <KBarSearch
        defaultPlaceholder={context[context.length - 1]?.placeholder}
        className="flex-1 text-base text-ramp-900 py-3 w-full outline-none"
        onKeyDown={async e => {
          if (e.key === "Backspace" && (e.target as HTMLInputElement).value.length === 0) {
            // Pop a context item on backspacing with no text
            setContext(context.slice(0, -1))
          } else if (e.key === "Tab") {
            // Push the highlighted result on to the context if possible
            e.preventDefault()
            let current = items[activeIndex];

            if (typeof current !== "string" && current.children) {
              // alert("searching..")
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
            }

          } else if (e.key === "Enter") {
            e.preventDefault()
            let current = items[activeIndex];

            // If the highlighted result has an action, do it and reset state
            if (typeof current !== "string" && current.perform) {
              setLoading(true)
              let result = await current.perform();

              query.setSearch("")
              setContext([])
            } else if (typeof current !== "string" && current.children) {
              // Otherwise, try to push the highlighted result to the context
              // This gives natural behavior if the user hits enter instead of tab
              const t0 = performance.now()
              current.children!("").then((t: any) => {
                setLoading(true)
                setItems(t ?? [])
                setLastResolvedQueryText("")
                setLastResolvedContext(context.length)

                setContext([...context, current as SearchActionResult])
                query.setSearch("");
                setLoading(false)
                setTime(performance.now() - t0)
              });
            }
          }
        }}
      />
      <div className="absolute top-0 bottom-0 right-4 flex items-center">

        <WarpspaceIcon className={loading ? "animate-pulse" : ""} />
      </div>
    </div>
    <div className="w-full px-4 pt-0 flex flex-row gap-x-2 items-center transition-[height] min-h-0 overflow-hidden" style={{ height: (searchedOnce.current) ? "3em" : "0px" }}>
      <div className="flex-1 text-left"><KeyCap>↑</KeyCap> <KeyCap>↓</KeyCap> to select, <KeyCap>?</KeyCap> for help</div>
      <div className="px-2 py-1 rounded border border-ramp-200 text-ramp-700 flex flex-row items-center">Best match <ChevronDownIcon className="w-4 h-4" /></div>
      <div className="px-2 py-1 rounded border border-ramp-200 text-ramp-700">Recent</div>
      <div className="px-2 py-1 rounded border border-ramp-200 text-ramp-700">Exact</div>
      <div className="px-2 py-1 rounded border border-ramp-200 text-ramp-700">Best match</div>

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
                items={items} />
            </div>
            <div className="self-stretch flex-[3] min-w-0  pb-10 border-l border-ramp-200 relative max-h-[400px] h-[400px] overflow-hidden">


              {/* <ScoreExplanation item={items[activeIndex] as ActionableRankedResult} /> */}
              <SearchPreview result={items[activeIndex] as SearchActionResult} key="preview" />
              <div className="overflow-hidden whitespace-nowrap text-ramp-700 text-sm p-4 pt-10 pb-3 bg-gradient-to-b from-transparent via-ramp-0 to-ramp-0 dark:via-ramp-100 dark:to-ramp-100 absolute bottom-0 left-0 right-0">
                <KeyCap>Enter</KeyCap> to open
                {(items[activeIndex] as any)?.children && <>, <KeyCap>Tab</KeyCap> to search within</>}</div>

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
            </div>
          </div>}



        {items.length === 0 && (queryText.length > 0 || loading) && searchedOnce.current &&
          <div className="select-none text-center w-full text-sm text-ramp-500 py-10 h-[400px] " style={{ display: (settingsOpen) ? "none" : "" }}>
            No results found.

          </div>}
      </div>}

    {!global && queryText.length > 0 &&
      <div className="border-t border-ramp-200 h-96">
        <div className="select-none text-center w-full text-sm text-ramp-500 py-10 " style={{ display: (settingsOpen) ? "none" : "" }}>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-focus" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            {/* <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle> */}
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Indexing...
        </div>
      </div>}

  </SearchBarAnimator>
  {/* </KBarPositioner> */ }
  {/* </KBarPortal> */ }
}


const RenderResults = React.memo(RenderResultsInner, (prev, next) => prev.effectiveContext == next.effectiveContext && prev.effectiveQuery === next.effectiveQuery)
function RenderResultsInner(props: { items: any[], effectiveQuery: any, effectiveContext: any }) {
  console.warn("RenderResults()", props.effectiveContext, props.effectiveQuery)
  return (
    <KBarResults
      items={props.items}
      onRender={({ item, active }: any) =>
        <div onClick={async () => {

          await item.perform()

        }}>{
            typeof item === "string" ?
              <SearchSectionHeading title={item} />
              :
              <SearchResult item={item} active={active} />
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

const SearchPreview: React.FC<{ result?: SearchActionResult }> = ({ result }) => {
  if (!result) return <>

  </>

  if (result.type === "page" || result.type === "visit") return <div className="px-4 py-4">
    <TabPreview tab={result.item} />
    <div className="space-y-1 flex-1 min-w-0 mt-2">
      <div className="flex flex-row gap-x-2 items-center px-[0.125rem] ">
        <h2 className={`text-base text-ramp-900 overflow-ellipsis ${result.title?.includes(" ") ? "break-words" : "break-all"}`}>
          <div className="float-left mt-[0.1875rem] align-middle w-[1.125rem] h-[1.125rem] rounded-sm leading-none mr-2" ><SmartFavicon item={result.item} /></div>
          {highlightChildren(result.title, result.debug.regex)}
        </h2>

      </div>
      <p className="text-xs text-ramp-500 break-all max-lines-3 overflow-hidden">
        {highlightChildren(result.url, result.debug.regex)}
      </p>
      {/* <div className="pt-4 text-xs flex flex-col">
        {result.type === "visit" && <p className="flex flex-row items-center gap-x-2">
          <div className="rounded-full bg-focus w-1.5 h-1.5 align-middle inline-block"></div><span>Open tab</span>
        </p>}
        {result.type === "page" && <p>
          Last open 2 days ago
        </p>}
        {result.type === "page" && <p>
          Open in 5 windows
        </p>}
      </div> */}

    </div>
  </div >


  if (result.type === "content") return <>
    <div className={`shadow-inner `}>
      {/* @ts-ignore */}
      <VirtualizedPreviewLazy frags={result.allFrags} startIndex={result.index} regex={result.debug.regex} />
    </div>
  </>

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