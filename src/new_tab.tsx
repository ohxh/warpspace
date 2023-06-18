import { useLiveQuery } from "dexie-react-hooks";
import domtoimage from "dom-to-image";
import { KBarProvider, useKBar, VisualState } from "kbar";
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { WarpspaceIcon } from "./components/primitives/icons/warpspace";
import { SearchBarModal } from "./components/search/SearchBar";
import { LocalStorageImage } from "./components/primitives/LocalStorageImage";
import { db, OpenVisit, TrackedWindow } from "./services/database/DatabaseSchema";
import { compressCapturedPreview } from "./services/previews/CaptureVisibleTab";
import { ImageStore } from "./services/previews/ImageStore";
import { index } from "./services/search/DexieSearchIndex";
import { BrandMenu } from "./services/settings/BrandMenu";
import { useSetting } from "./hooks/useSetting";
import { WarpspaceSettingsProvider } from "./services/settings/WarpspaceSettingsContext";
import "./styles/style.css";
import "./styles/theme.css";
import "./styles/prose.css";
import { createRoot } from "react-dom/client";

export const SearchBar = () => {
  const { query, visualState } = useKBar(s => ({ visualState: s.visualState }));

  // const lastVisualState = usePreviousPersistent(visualState)
  // useEffect(() => {
  //   if (visualState === VisualState.hidden && lastVisualState === VisualState.animatingOut) {
  //     window.top!.postMessage(
  //       { event: "exit-search" },
  //       { targetOrigin: "*" }
  //     );
  //   }
  // }, [visualState, lastVisualState])

  useEffect(() => {
    let f = (m: any) => {
      if (m.event === "enter-search") query.setVisualState(VisualState.animatingIn)
      else if (m.event === "exit-search") query.setVisualState(VisualState.animatingOut)
    }
    chrome.runtime.onMessage.addListener(f);
    return () => chrome.runtime.onMessage.removeListener(f)
  }, [])


  return <div className="relative">
    <div
      style={{
        opacity: visualState === VisualState.showing ? 0 : 1
      }}
      onClick={() => query.setVisualState(VisualState.animatingIn)}
      className="select-none max-w-4xl w-full bg-ramp-0 dark:bg-ramp-100 border border-ramp-300 rounded-md overflow-hidden shadow transition-all">
      <div className="text-ramp-500 flex-1 text-base px-4 py-3 w-full outline-none hover:text-ramp-700 transition-colors">Type a command or search...</div>
      <div className="absolute top-0 bottom-0 right-4 flex items-center">
        <WarpspaceIcon />
      </div>
    </div>
    <div className="absolute top-0 left-0 right-0">
      {visualState !== VisualState.hidden &&
        <SearchBarModal subtle />}
    </div>
  </div>
};

const NewTabApp = () => {

  const postings = useLiveQuery(() => index.db.body.count())

  const docs = useLiveQuery(() => index.db.docs.count())
  return <div className="flex flex-col w-[100vw] h-[100vh] inset-0 bg-ramp-0">
    <div className="fixed top-0 left-0 right-0  px-2.5 py-1 text-sm h-6"><BrandMenu /></div>
    <div className="flex-1 flex flex-col pb-24 mx-12 items-center place-content-center gap-y-28">

      <div className="w-full flex flex-row items-center gap-x-10 place-content-center text-5xl mt-12">
        {/* <WarpspaceIcon className="w-12 h-12" /> */}
        {/* <img className="w-40 h-40" src={chrome.runtime.getURL("/seal.png")} /> */}
        <div className="font-serif text-6xl text-ramp-800 select-none"> Warpspace</div>
      </div>
      <div
        style={{ maxWidth: useSetting("appearance.width") === "wide" ? "72rem" : "56rem" }}
        className="w-full px-8 relative z-50">
        <KBarProvider actions={[]} options={{
          animations: useSetting("appearance.animations") === "none" ? {
            enterMs: 0,
            exitMs: 0,
          } : {
            enterMs: 0,
            exitMs: 200,
          },
        }}>
          <SearchBar />
        </KBarProvider>
      </div>
      <div className="h-32 pt-16" />
      {/* <div className="pt-16">
        <Suggestions />
      </div> */}
      {/* <div className="flex flex-row gap-x-4 place-content-center items-center mt-80">
      {[1, 2, 3, 4].map(t => <div className="tab aspect-[16/9] rounded bg-ramp-300" />)}
    </div> */}
    </div>
    <div className="select-none fixed bottom-0 left-0 right-0 bg-ramp-100 px-2.5 py-1 text-sm text-ramp-700 flex place-content-between">
      <span className="text-left">7 tabs open (2323 total)  -  {postings ?? "(?)"} postings, {docs ?? "(?)"} docs</span>
      <span>
        v. 0.0.16 <a className="underline" href="https://warpspacelabs.com/changelog">(changelog)</a>
      </span>
    </div>
  </div>
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <WarpspaceSettingsProvider>
      <NewTabApp />
    </WarpspaceSettingsProvider>
  </React.StrictMode>
);


var node = document.body;
const x = new ImageStore()

setTimeout(() =>
  domtoimage.toPng(node)
    .then(async function (dataUrl) {
      x.store("newtab", await compressCapturedPreview(dataUrl))
    })
    .catch(function (error: any) {
      console.error('oops, something went wrong!', error);
    }), 100);

chrome.runtime.sendMessage({ event: "new-tab-open" })


export const Suggestions: React.FC<{}> = ({ }) => {
  const recentspaces = useLiveQuery(async () => await db.windows.limit(4).toArray());
  return <div className="flex flex-row place-content-between items-end h-40 gap-x-4">
    {recentspaces?.map(s => <SuggestionResult3 space={s} key={s.id} />)}
  </div>
}


export const SuggestionResult3: React.FC<{ space: TrackedWindow, }> = ({ space, }) => {

  const tabs2 = useLiveQuery(
    space.status === "open" ?
      () => db.tabs.where("windowId").equals(space.id!).and(x => x.status === "open").toArray() as Promise<OpenVisit[]>
      : () => db.tabs.where("windowId").equals(space.id!).and(x => x.status === "closed" && x.closingReason === "window-closed").toArray() as Promise<OpenVisit[]>)

  const tabs = tabs2 ? [...tabs2.filter(t => t.metadata.previewImage), ...tabs2.filter(t => !t.metadata.previewImage)] : [];
  return <>
    {tabs.length}
    <div className={`flex flex-col gap-x-4 group select-none cursor-pointer p-6 rounded-md`}>
      <div className="relative z-0 mr-8">
        {tabs?.slice(0, 1)?.map(tab => <div className="max-w-[16em] cursor-pointer group-active:opacity-80">
          <LocalStorageImage srcKey={tab.metadata?.previewImage || "none"} alt="" className={`bg-ramp-100 dark:bg-ramp-200 aspect-[16/9] w-full border border-ramp-300 rounded-md  object-cover`} />
          {/* <div className={`absolute inset-0 rounded-md transition-opacity `}></div> */}
        </div>
        )}
        {tabs?.slice(1, 5)?.map((tab, i) => <div className="max-w-[16em] cursor-pointer group-active:opacity-80 absolute top-0"
          style={{ transform: `translateX(${[20, 36, 50, 62][i]}px) scale(${[95, 89, 83, 76][i]}%)`, zIndex: -(i + 1) }}
        >
          <LocalStorageImage srcKey={tab.metadata?.previewImage || "none"} alt="" className={`bg-ramp-100 dark:bg-ramp-200 aspect-[16/9] w-full border border-ramp-300 rounded-md  object-cover`} />
          <div className={`absolute inset-0 rounded-md transition-opacity shadow-md`}></div>
        </div>
        )}
      </div>

      <div className="flex-1 items-stretch min-w-0 mt-2">

        <div className="flex flex-row gap-x-2 items-baseline">
          <span className="text-ellipsis whitespace-nowrap overflow-hidden text-base antialiased" >
            {(space).title || "Untitled space"}
          </span>
          <span className="text-ramp-500 text-sm ml-0">
            · {tabs2?.length} tab{tabs?.length === 1 ? "" : "s"}
          </span>
        </div>
        <p className="text-ramp-700 text-sm max-lines-2 overflow-hidden">
          Open now

        </p>
        {/* {highlighted && <div className="mt-1 text-sm text-ramp-900">Enter to open, space to add to current window, tab to view sub-loci</div>} */}
      </div>
    </div>
  </>
}