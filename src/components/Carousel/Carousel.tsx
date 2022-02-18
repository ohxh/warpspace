import { PlusIcon, DocumentTextIcon } from "@heroicons/react/outline";
import React, { useRef } from "react";
import { ReactSortable } from "react-sortablejs";
import { ActiveVisit } from "../../services/Database";
import { HydratedWindow } from "../../services/TabStore";
import { OverviewTab } from "../OverviewTab/OverviewTab";
import { OverviewWindow } from "../OverviewWindow/OverviewWindow";

let x = false;
let xT: number | undefined = undefined;

export const CarouselContent: React.FC<{
  browserState: HydratedWindow[];
  handleWindowChange: (w: HydratedWindow, l: ActiveVisit[]) => void;
  toggleSelected: (x: number) => void;
  currentTab: number,
  onDragStart: () => void;
  onDragEnd: () => void
}> = ({ onDragStart, onDragEnd, browserState, toggleSelected, currentTab, handleWindowChange }) => {

  // console.warn("!! Carousel Rendekkrs");
  // Map of refs from tab IDs for manipulating focus
  const tabRefs = useRef<Record<number, HTMLButtonElement>>({});

  const focusUp = () => {
    const active = document.activeElement;
    const focused = parseInt(active?.getAttribute("data-tab-id") || "");

    var location: [number, number] = browserState
      .map((n) => n.tabs.findIndex((n) => n.id === focused))
      .map((v, i) => [i, v])
      .find(([w, t]) => t >= 0) as [number, number];

    if (location[1] - 6 >= 0) location[1] -= 6;

    tabRefs.current[browserState[location[0]].tabs[location[1]].id].focus({
      preventScroll: true,
    });
    tabRefs.current[browserState[location[0]].tabs[location[1]].id].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const focusDown = () => {
    const active = document.activeElement;
    const focused = parseInt(active?.getAttribute("data-tab-id") || "");

    var location: [number, number] = browserState
      .map((n) => n.tabs.findIndex((n) => n.id === focused))
      .map((v, i) => [i, v])
      .find(([w, t]) => t >= 0) as [number, number];
    var location: [number, number] = browserState
      .map((n) => n.tabs.findIndex((n) => n.id === focused))
      .map((v, i) => [i, v])
      .find(([w, t]) => t >= 0) as [number, number];

    if (location[1] + 6 < browserState[location[0]].tabs.length) location[1] += 6;
    else if (location[1] % 6 >= (browserState[location[0]].tabs.length - 1) % 6)
      location[1] = browserState[location[0]].tabs.length - 1;

    tabRefs.current[browserState[location[0]].tabs[location[1]].id].focus({
      preventScroll: true,
    });
    tabRefs.current[browserState[location[0]].tabs[location[1]].id].scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const focusLeft = () => {
    const active = document.activeElement;
    const focused = parseInt(active?.getAttribute("data-tab-id") || "");

    var location: [number, number] = browserState
      .map((n) => n.tabs.findIndex((n) => n.id === focused))
      .map((v, i) => [i, v])
      .find(([w, t]) => t >= 0) as [number, number];

    if (location[1] % 6 === 0) {
      if (location[0] - 1 >= 0) {
        location[0] -= 1;
        location[1] += 5;

        tabRefs.current[browserState[location[0]].tabs[location[1]].id].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });

        if (location[1] >= browserState[location[0]].tabs.length)
          location[1] = browserState[location[0]].tabs.length - 1;
      }
    } else {
      if (location[1] - 1 >= 0) location[1] -= 1;
    }

    tabRefs.current[browserState[location[0]].tabs[location[1]].id].focus({
      preventScroll: true,
    });

  };

  const focusRight = () => {
    const active = document.activeElement;
    const focused = parseInt(active?.getAttribute("data-tab-id") || "");

    var location: [number, number] = browserState
      .map((n) => n.tabs.findIndex((n) => n.id === focused))
      .map((v, i) => [i, v])
      .find(([w, t]) => t >= 0) as [number, number];

    if (location[1] % 6 === 5) {
      if (location[0] + 1 < browserState.length) {
        location[0] += 1;
        location[1] -= 5;
        if (location[1] >= browserState[location[0]].tabs.length)
          location[1] = browserState[location[0]].tabs.length - 1;

        tabRefs.current[browserState[location[0]].tabs[location[1]].id].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    } else if (location[1] === browserState[location[0]].tabs.length - 1) {
      // alert("hi")
      if (location[0] + 1 < browserState.length) {
        location[0] += 1;
        location[1] =
          Math.floor(
            Math.min(location[1], browserState[location[0]].tabs.length - 1) / 6
          ) * 6;
      }
    } else {
      if (location[1] + 1 < browserState[location[0]].tabs.length) location[1] += 1;
    }

    tabRefs.current[browserState[location[0]].tabs[location[1]].id].focus({
      preventScroll: true,
    });

  };


  return <div
    onKeyDown={(e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusLeft();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        focusRight();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        focusUp();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusDown();
      }
    }}
    className="min-h-full min-w-full w-max flex py-20"
    style={{
      paddingLeft: "var(--carousel-edge-padding)",
      paddingRight: "var(--carousel-edge-padding)",
    }}
  >

    {browserState.map((w, i) => (
      <OverviewWindow data={w} key={w.id}>
        <ReactSortable
          onEnd={e => { e.item.querySelector("button")?.focus(); onDragEnd() }}
          onStart={e => onDragStart()}
          group="shared"
          selectedClass="sortable-selected"
          className="tab-grid"
          ghostClass="sortable-ghost"
          dragClass="sortable-drag"
          animation={150}
          scrollSensitivity={100}
          //@ts-ignore
          multiDragKey="Alt"
          multiDrag
          handle=".sortable-handle"
          list={w.tabs}
          onMove={(e) => {
            console.log(e.to)
            if (!x) {
              e.to.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
              });
              x = true;
              setTimeout(() => x = false, 1000)
            }
            return true;
          }}
          setList={(l) => {
            handleWindowChange(w, l);
          }}
          onSelect={(e) =>
            toggleSelected(parseInt(e.item.id))
          }
          onDeselect={(e) =>
            toggleSelected(parseInt(e.item.id))
          }
        >
          {w.tabs.map((tab, i) => (
            <OverviewTab
              key={tab.id}
              current={currentTab == tab.chromeId}
              //@ts-ignore
              tab={tab}
              //@ts-ignore
              tabRef={(e) => (tabRefs.current[tab.id] = e)}
            />
          ))}
        </ReactSortable>

        <div className="flex pt-4 space-x-4 w-full border-t mt-4">
          <a
            className="block tab"
            onClick={() => {
              chrome.tabs.create({ active: true, windowId: w.chromeId });
              chrome.windows.update(w.chromeId, { focused: true });
            }}
            target="_blank"
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
          </a>
          <a
            className="block tab"
            onClick={() => {
              chrome.tabs.create({
                active: true,
                windowId: w.chromeId,
                url: chrome.runtime.getURL("/notes.html"),
              });
              chrome.windows.update(w.chromeId, { focused: true });
            }}
            target="_blank"
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
          </a>
        </div>
      </OverviewWindow>
    ))}
  </div>
}

export const Carousel = React.memo(CarouselContent,

)
