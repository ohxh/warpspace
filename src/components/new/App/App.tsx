import { useDebounce } from "@react-hook/debounce";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useRef, useState } from "react";
import { db, ActiveVisit } from "../../../services/Database";
import { HydratedWindow } from "../../../services/TabStore";
import { Carousel } from "../Carousel/Carousel";
import { Header } from "../Header/Header";
import { Minimap } from "../Minimap/Minimap";
import { tabSelectionContext } from "./SelectionContext";

export const OverviewApp: React.FC<{}> = ({ }) => {
  const [selectionIds, setSelectionIds] = useState<number[]>([]);

  const [currentTab, setCurrentTab] = useState<number>(0);
  useEffect(() => {
    chrome.tabs.getCurrent((t) => {
      setCurrentTab(t!.id!);
    });
  }, []);

  const [scroll, setScroll] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const [minimapVisible, setMinimapVisibleDebounce, setMinimapVisible] =
    useDebounce(false, 2000);
  const onScroll = () => {
    setMinimapVisible(true);
    setMinimapVisibleDebounce(false);
  };

  const visits = (useLiveQuery(async () => {
    return await db.visits.where("status").equals("active").toArray();
  }) || []) as ActiveVisit[];

  const windows = useLiveQuery(() => db.windows.toArray()) || [];

  const fullWindows: HydratedWindow[] = windows?.map((m) => ({
    ...m,
    tabs: visits
      .filter((v) => v.windowId == m.id)
      .sort((a, b) => a.position.index - b.position.index),
  }));
  const [override, setOverride, setOverrideInstant] = useDebounce<
    HydratedWindow[] | undefined
  >(undefined, 1000);

  return (
    <tabSelectionContext.Provider value={visits.filter(v => selectionIds.includes(v.id))}>
      <Header />
      <div className="bg-background h-screen w-screen no-scrollbar overflow-scroll snap-x snap-mandatory overscroll-contain">
        <Carousel
          browserState={fullWindows}
          updateBrowserState={() => null}
          toggleSelected={(x) =>
            setSelectionIds(
              selectionIds.includes(x)
                ? selectionIds.filter((y) => y !== x)
                : [...selectionIds, x]
            )
          }
          currentTab={currentTab}
        />
      </div>
      <Minimap
        minimapVisible={minimapVisible}
        browserState={fullWindows}
        scrollState={scroll}
      />
    </tabSelectionContext.Provider>
  );
};
