
import { useLiveQuery } from "dexie-react-hooks";
import React, { Fragment, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Flipper } from "react-flip-toolkit";
import { WWindow } from "./components/Window/Window";
import { ActiveVisit, db, } from "./services/Database";
import { HydratedWindow } from "./services/TabStore";
import './style.css';
import { Header } from "./components/Header/Header";
import { ThemeProvider } from "./components/Theme/ThemeProvider";



// Max tab width
// max window width

// actual tab width = max(window percent divided up, max tab width)

const App: React.FC = () => {

  const visits = (useLiveQuery(async () => {
    return await db.visits.where("status").equals("active").toArray();
  }) || []) as ActiveVisit[];

  const windows = useLiveQuery(() => db.windows.toArray()) || [];

  const hydr: HydratedWindow[] = windows?.map(m => ({ ...m, tabs: visits.filter(v => v.windowId == m.id).sort((a, b) => a.position.index - b.position.index), chromeId: 1 }));

  // ids of selected tabs
  const [selection, setSelection] = useState<number[]>([]);
  // id of current focused tab 
  const [focused, setFocused] = useState<number>();

  const [scroll, setScroll] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0
  })

  return (

    <div className="bg-white dark:bg-gray-100 h-screen w-screen no-scrollbar overflow-scroll snap-x snap-mandatory overscroll-contain" style={{ scrollBehavior: "smooth" }}
      onScroll={(e) => {
        setScroll({
          top: e.currentTarget.scrollTop,
          left: e.currentTarget.scrollLeft,
          width: e.currentTarget.offsetWidth,
          height: e.currentTarget.offsetHeight,
        })
      }}
    >
      <Header tab={visits[0]} />
      {/* Scrollable "tape" of windows */}
      <div className="min-h-full min-w-full w-max whitespace-nowrap flex py-20"
        style={{ paddingLeft: "var(--carousel-edge-padding)", paddingRight: "var(--carousel-edge-padding)" }}
      >
        {hydr.map((w, i) =>
          <WWindow data={w} key={w.id} />)}
      </div>
      <div className="fixed bottom-2 right-2" style={{ height: `${scroll.height / 10}px` }}>
        <div className="border border-gray-600 rounded absolute" style={{ transform: `translate(${scroll.left / 10}px, ${scroll.top / 10}px)`, width: `${scroll.width / 10}px`, height: `${scroll.height / 10}px` }} />
        <div className="flex items-start py-2 pb-8 " style={{ paddingLeft: "calc(var(--carousel-edge-padding)/10)", paddingRight: "calc(var(--carousel-edge-padding)/10)" }}>
          {hydr.map((w, i) =>
            <div className="minimap-tab-grid minimap-window mt-3" key={w.id}>
              {w.tabs.map(t => <div className="h-[13px] rounded-sm bg-gray-300" key={t.id}></div>)}
            </div>)}
        </div>
      </div>
    </div >
  );
};



const FocusHider: React.FC = ({ children }) => {
  const [chatFocus, setChatFocus] = useState(!document.hidden);
  console.log("bbb")

  useEffect(() => {

    const handlevis = () => {
      if (document.hidden) {
        setChatFocus(false);
        console.log("blur")
      } else {
        setChatFocus(true);
        console.log("unblur")
      }
    };

    document.addEventListener('visibilitychange', e => handlevis())

  }, [chatFocus]);

  return chatFocus ? <>{children}</> : <>No Focus</>
}


ReactDOM.render(
  <React.StrictMode>
    <FocusHider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </FocusHider>
  </React.StrictMode>,
  document.getElementById("root")
);


/** Amount zoomed in from baseline before exiting warpsace. */
const EXIT_WARPSPACE_THRESHOLD = -1;


//Catch events to leave warpspace
document.addEventListener('wheel', function (e) {
  // Pinch zoom gestures come in as ctrl + scroll for backwards compatibility
  if (e.ctrlKey) {
    console.warn(e.deltaY)
    if (e.deltaY < EXIT_WARPSPACE_THRESHOLD) {
      console.log("trying to leave")
      window.top!.postMessage({ event: "exit-warpspace" }, { targetOrigin: "*" })
    }
    e.preventDefault()
  }
}, { passive: false });
