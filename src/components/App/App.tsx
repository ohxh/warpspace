import { useDebounce } from "@react-hook/debounce";
import { useLiveQuery } from "dexie-react-hooks";
import { produce } from "immer";
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { db, ActiveVisit } from "../../services/Database";
import { HydratedWindow } from "../../services/TabStore";
import { Carousel } from "../Carousel/Carousel";
import { Header } from "../Header/Header";
import { Minimap } from "../Minimap/Minimap";
import { tabSelectionContext } from "./SelectionContext";

export const OverviewApp: React.FC<{}> = ({ }) => {
  const [selectionIds, setSelectionIds] = useState<number[]>([]);

  const toggleSelected = useCallback((x: number) => {
    console.log("ToggleSelected ", x)
    setSelectionIds(old => old.includes(x)
      ? old.filter((y) => y !== x)
      : [...old, x])
  }, []);

  const [currentTab, setCurrentTab] = useState<number>(0);

  useEffect(() => {
    console.log("setCurrentTab")
    chrome.tabs.getCurrent((t) => {
      setCurrentTab(t!.id!);
    });
  }, []);

  useEffect(() => {
    chrome.tabs.getZoom()
  }, []);

  const [scroll, setScroll] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const [minimapVisible, setMinimapVisibleDebounce, setMinimapVisible] =
    useDebounce(false, 2000);


  const visits = useLiveQuery(async () => {
    const result = await db.visits.where("status").equals("active").toArray() as ActiveVisit[];
    return result;
  }, [], [])

  const windows = useLiveQuery(() => db.windows.toArray(), [], []);

  // console.warn("Render kapp with windows", windows.length)
  //@ts-ignore TODO
  const fullWindows: HydratedWindow[] = windows?.map((m) => ({
    ...m,
    tabs: visits
      .filter((v) => v.windowId == m.id)
      .sort((a, b) => a.position.index - b.position.index),
  }));

  const [override, setOverride, setOverrideInstant] = useDebounce<
    HydratedWindow[] | undefined
  >(undefined, 1600);

  const handleWindowChange = useCallback((w: HydratedWindow, updated: ActiveVisit[]) => {
    // console.log("HandleWindowChange")
    if (w.tabs.map(t => t.id).join("-") === updated.map(t => t.id).join("-")) {
      // console.log("bailed");
      return;
    }

    updated.forEach((t, i) => {
      chrome.tabs.move(t.chromeId, { index: i, windowId: w.chromeId })

      if (t.chromeId === currentTab) {
        chrome.windows.update(w.chromeId, { focused: true })
        chrome.tabs.update(t.chromeId, { active: true })
        //todo block exiting
      }
      // if(w.tabs.includes(t)) {
      //   if(w.tabs.indexOf(t) === i) return;
      //   else {

      //   }
      // } else {
      //   // Move to the new window in chrome
      //   copy.splice(if)
      // }
    })

    // If l contains a new tab, move it across windows
    // If l has lost a tab, ignore it. (the other sortable will fire to move it)
    // If a tab in l has moved    

    setOverride(undefined)
    setOverrideInstant(
      produce((override || fullWindows), (draft) => {
        //@ts-ignore TODO
        draft.find(d => d.id! === w.id!)!.tabs = updated;
      })
    );
  }, [override, fullWindows]);

  const [scrolling, setScrolling] = useState(false);
  const startScroll = useCallback(() => { console.log("onDragStart"); setScrolling(true) }, [setScrolling])
  const stopScroll = useCallback(() => { console.log("onDragEnd"); setScrolling(false) }, [setScrolling])

  // console.warn("!! App Renders ", visits.updated);

  //@ts-ignore
  const browserState = useMemo(() => override || fullWindows, [override, fullWindows])

  return (
    <div>
      <tabSelectionContext.Provider value={visits.filter(v => selectionIds.includes(v.id!))}>
        <Header />
        <div
          onScroll={(e) => {
            const el = e.currentTarget;
            setScroll({
              top: el.scrollTop,
              left: el.scrollLeft,
              width: el.clientWidth,
              height: el.clientHeight
            })
            setMinimapVisible(true);
            setMinimapVisibleDebounce(false);
          }}
          className={`bg-background h-screen w-screen no-scrollbar overflow-scroll ${scrolling ? "" : "snap-mandatory snap-x"} overscroll-contain will-change-scroll`}>

          <Carousel
            browserState={browserState}
            handleWindowChange={handleWindowChange}

            onDragStart={startScroll}
            onDragEnd={stopScroll}

            toggleSelected={toggleSelected}
            currentTab={currentTab}
          />
        </div>
        <Minimap
          pingVisible={() => {
            setMinimapVisible(true);
            setMinimapVisibleDebounce(false);
          }}
          minimapVisible={minimapVisible}
          browserState={fullWindows}
          scrollState={scroll}
        />
      </tabSelectionContext.Provider>
    </div>
  );
};
