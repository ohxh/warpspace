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

    if (active?.id.startsWith("window-newtab")) {
      // focus something

    }
    if (active?.id.startsWith("window-newnote")) {
      //focus something else
    }

    const tab = browserState
      .map((n) => n.tabs.find((n) => n.id === focused))
      .filter(x => x !== undefined)[0]

    var location: [number, number] = browserState
      .map((n) => n.tabs.findIndex((n) => n.id === focused))
      .map((v, i) => [i, v])
      .find(([w, t]) => t >= 0) as [number, number];


    if (location[1] - 6 < 0) {
      document.getElementById(`window-title-${tab!.windowId}`)?.focus()
      return;
    }
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

    const tab = browserState
      .map((n) => n.tabs.find((n) => n.id === focused))
      .filter(x => x !== undefined)[0]
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
    else {
      if (location[1] % 6 == 0) document.getElementById(`window-newtab-${tab!.windowId}`)?.focus()
      if (location[1] % 6 > 0) document.getElementById(`window-newnote-${tab!.windowId}`)?.focus()
      return;
    }

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


    const tab = browserState
      .map((n) => n.tabs.find((n) => n.id === focused))
      .filter(x => x !== undefined)[0]
    var location: [number, number] = browserState
      .map((n) => n.tabs.findIndex((n) => n.id === focused))
      .map((v, i) => [i, v])
      .find(([w, t]) => t >= 0) as [number, number];

    if (location[1] % 6 === 0) {
      if (location[0] - 1 >= 0) {
        location[0] -= 1;
        location[1] += 5;

        if (location[1] >= browserState[location[0]].tabs.length)
          location[1] = browserState[location[0]].tabs.length - 1;

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

    const tab = browserState
      .map((n) => n.tabs.find((n) => n.id === focused))
      .filter(x => x !== undefined)[0]
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

        tabRefs.current[browserState[location[0]].tabs[location[1]].id].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
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
        //e.preventDefault();
        focusLeft();
      }
      if (e.key === "ArrowRight") {
        //e.preventDefault();
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
    className="min-h-full min-w-full w-max flex py-20 px-[50vw]"
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
          scrollSpeed={10}
          //@ts-ignore
          multiDragKey="Alt"
          multiDrag
          handle=".sortable-handle"
          list={w.tabs}
          onMove={(e) => {
            console.log(e.to)
            if (!x) {
              // e.to.scrollIntoView({
              //   behavior: "smooth",
              //   block: "nearest",
              //   inline: "center",
              // });
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


      </OverviewWindow>
    ))}
  </div>
}

export const Carousel = React.memo(CarouselContent,

)
