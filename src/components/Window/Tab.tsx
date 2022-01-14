import { Children, useEffect, useMemo, useRef, useState } from "react";
import { ActiveVisit } from "../../services/Database";
import { ImageStore } from "../../services/ImageStore";
import { ControlledMenu, Menu, MenuButton, MenuDivider, MenuHeader, MenuItem, SubMenu, useMenuState } from "@szhsin/react-menu";
import "./menu.css"
import React from "react";
import { useDebounce } from "@react-hook/debounce";
import { ChromeIcon } from "./ChromeIcon";
import { WorldIcon } from "./WorldIcon";
import { XIcon } from "@heroicons/react/solid";
import { OverviewTabContextMenu } from "../new/OverviewTab/OverviewTabContextMenu";
import { useTabSelection } from "../new/App/SelectionContext";

const MyApp: React.FC<{ selectedTabs: ActiveVisit[], tab: ActiveVisit }> = ({ children, tab, selectedTabs, }) => {
  const { toggleMenu, ...menuProps } = useMenuState();

  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });

  const tabs = selectedTabs.some(x => x.id === tab.id) ? selectedTabs : [tab]
  return <div
    onMouseUp={e => e.preventDefault()}
    onMouseDown={e => e.stopPropagation()}
    onContextMenu={e => {
      e.preventDefault();
      setAnchorPoint({ x: e.clientX, y: e.clientY });
      toggleMenu(true);
    }}>
    {children}
    <ControlledMenu
      menuClassName={"text-[13px] text-gray-900 rounded-md shadow-xl p-1 w-48 max-w-48 bg-background ring-[1px] ring-[#000] ring-opacity-[10%] backdrop-blur-md z-40"}
      {...menuProps}
      anchorPoint={anchorPoint}
      onClose={() => toggleMenu(false)}>
      <MenuHeader className={(s) => `rounded-md py-0.5 pt-2 px-2 w-[20rem]`} >
        {tabs.length == 1 &&
          <><div className="flex flex-row gap-x-2 items-start px-[2px] title w-full">
            <span
              style={{ WebkitLineClamp: "2" }}
              className="flex-1 text-ellipsis overflow-hidden text-[14px] font-medium antialiased text-gray-900" >
              {tabs[0].metadata.title ?? "New Tab"}
            </span>
          </div>
            <div
              className="text-gray-500 text-ellipsis overflow-hidden text-[12px] mt-1 break-all">
              <div style={{ display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical" }}>
                {tabs[0].metadata.url}
              </div>
            </div></>}
        {tabs.length > 1 &&
          <div className="flex">
            <div className="flex-1 flex flex-wrap gap-1 overflow-hidden">
              {tabs.sort((a, b) => a.position.index - b.position.index)

                .map(t =>
                  <img
                    className="inline-block h-[18px] w-[18px] rounded-sm bg-background"
                    src={t.metadata.favIconUrl}
                    alt=""
                  />)}
            </div>
            {tabs.length} tabs
          </div>

        }
      </MenuHeader>
      <MenuDivider className="border-b border-gray-200 mx-2 my-2" />
      <MenuItem className={(s) => `rounded-md hover:bg-gray-100  py-1 px-2 w-20`}>Close others</MenuItem>
      <SubMenu label="Move" className={(s) => `rounded-md hover:bg-gray-100 py-1 px-2 w-20`} menuClassName={"text-[13px] text-gray-900 rounded-md shadow-xl p-1 w-48 bg-background ring-[1px] ring-[#000] ring-opacity-[10%] backdrop-blur-md z-40"}>
        <MenuItem className={(s) => `rounded-md hover:bg-gray-100  py-1 px-2 w-20`}>about.css</MenuItem>
        <MenuItem className={(s) => `rounded-md hover:bg-gray-100  py-1 px-2 w-20`}>home.css</MenuItem>
        <MenuItem className={(s) => `rounded-md hover:bg-gray-100  py-1 px-2 w-20`}>index.css</MenuItem>
      </SubMenu>
      <MenuItem className={(s) => `rounded-md hover:bg-gray-100  py-1 px-2 w-20`}>Duplicate</MenuItem>
      <MenuItem className={(s) => `rounded-md hover:bg-gray-100  py-1 px-2 w-20`}>Close</MenuItem>
    </ControlledMenu>
  </div >
}

export const Tab: React.FC<{ current: Boolean, tab: ActiveVisit, tabRef: (x: HTMLElement | null) => void }> = ({ current, tabRef, tab, }) => {

  const selectino = useTabSelection()
  const ref = useRef<HTMLButtonElement | null>(null);
  const [zoomingIn, setZoomingInDebounce, setZoomingIn] = useDebounce(false, 300);

  useEffect(() => {
    window.addEventListener("message", (m) => {
      if (current && m.data.event === "enter-warpspace") {
        ref.current?.focus({ preventScroll: true })
        ref.current?.scrollIntoView({ block: "nearest", inline: "center" })
        console.warn("Focusing" + tab.metadata.title, ref.current)
        setZoomingIn(true);
        setZoomingInDebounce(false);
      }
    });
    // document.body.style.opacity = '0'
  })

  useEffect(() => {
    if (current) {
      // ref.current!.scrollIntoView({ block: "center", inline: "center" })
    }
  }, [])

  return <div key={tab.id} className="tab" id={`${tab.id}`}>
    <div className="selection sortable-drag:bg-pink"></div>
    <OverviewTabContextMenu>
      <button
        data-tab-id={tab.id}
        key={tab.id}
        onClick={(e) => {
          if (e.altKey || e.ctrlKey) return;
          // setZoomingIn(true);
          // setTimeout(() => {]
          if (current) {
            window.top!.postMessage(
              { event: "exit-warpspace" },
              { targetOrigin: "*" }
            );
          } else {
            chrome.windows.update(tab.chromeWindowId, { focused: true })
            chrome.tabs.update(tab.chromeId, { active: true })
          }


          // }, 50)
        }
        }
        ref={e => { tabRef(e); ref.current = e; }}
        className={`focus:outline-none group grid-tab w-full cursor-default text-left bg-none relative`}>
        <div className={`sortable-handle relative bg-gray-100 aspect-[16/9] w-full  rounded-md group-focus:ring-[3px] group-focus:ring-focus group-focus:ring-offset-background group-focus:ring-offset-2 group-focus:relative group-focus:z-20`}>
          <div className="absolute inset-9 rounded-md grid place-items-center grayscale opacity-20">
            {tab.metadata.favIconUrl && <img src={tab.metadata.favIconUrl} alt="hi" className="mt-[1px] w-8 h-8 rounded"></img>}
            {!tab.metadata.favIconUrl && !tab.metadata.url && <ChromeIcon className="mt-[1px] w-7 h-7 rounded-sm text-gray-800" />}
            {!tab.metadata.favIconUrl && tab.metadata.url && <WorldIcon className="mt-[1px] w-8 h-8 rounded-sm text-gray-800" />}
          </div>
          {tab.crawl.lod == 1 && tab.crawl.previewImage && <LocalStorageImage srcKey={tab.crawl.lod === 1 ? (tab.crawl.previewImage || "none") : "none2"} className={`absolute inset-0 rounded-md object-cover h-full w-full ${zoomingIn ? "zoomout" : ""}`} />}
          <div className="absolute inset-0 rounded-md border border-gray-300"></div>
          <div className="absolute inset-0 rounded-md bg-black opacity-0 group-active:opacity-0 transition-opacity duration-[50ms] drag-hidden"></div>
          {/* {selection.length > 0 &&
            <div className="absolute inset-0 rounded-md bg-focus opacity-30 drag-focus-overlay"></div>}
          {selection.length > 0 &&
            <div className="absolute inset-0 grid place-items-center  drag-focus-overlay"><div className="text-focus text-xl">{selection.length} tabs</div></div>} */}

          {/* {current && <div className="absolute inset-0 rounded-md bg-green opacity-40 transition-opacity duration-[50ms] drag-hidden"></div>} */}
        </div>
        <div className="relative mt-2">
          <div className="flex flex-row gap-x-2 items-center px-[1px] title">
            {tab.metadata.favIconUrl && <img src={tab.metadata.favIconUrl} alt="hi" className="mt-[1px] w-[18px] h-[18px] rounded-sm "></img>}
            {!tab.metadata.favIconUrl && !tab.metadata.url && <ChromeIcon className="mt-[1px] w-[15px] h-[15px] rounded-sm text-gray-800" />}
            {!tab.metadata.favIconUrl && tab.metadata.url && <WorldIcon className="mt-[1px] w-[18px] h-[18px] rounded-sm text-gray-800" />}
            <span className="flex-1 text-ellipsis whitespace-nowrap overflow-hidden text-[14px] antialiased text-gray-900" >
              {selectino.length}
              hi
              {!tab.metadata.url && "New Tab"}
              {tab.metadata.title}

            </span>
          </div>
          <div className="opacity-0 hover:opacity-100 transition-opacity absolute right-0 top-0 bottom-0 flex flex-row items-center pl-6 bg-gradient-to-r tab-x-background">
            <button className="rounded-sm p-1 tab-x-button">
              <XIcon className="w-[14px] h-[14px] text-gray-800"></XIcon>
            </button>
          </div>
        </div>
      </button>
    </OverviewTabContextMenu>
  </div >
}


export interface LocalStorageImageProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  srcKey: string;
}
const x: ImageStore = new ImageStore();

export const LocalStorageImage: React.FC<LocalStorageImageProps> = ({ srcKey, ...props }) => {


  const [img, setImg] = useState<string>();
  const result = useEffect(() => {
    (async () => {
      setImg(srcKey ? await x.get(srcKey) : "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");
      console.log("IMAGE IN COMP IS", srcKey, await x.get(srcKey) || "");
    })()
  }, [srcKey])
  return <img {...props} src={img} />
}

(async () => {
  console.log("CONTS", await chrome.storage.local.get())
})()

