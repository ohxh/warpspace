import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { TrackedWindow, db, OpenVisit } from "../../services/database/DatabaseSchema";
import { LocalStorageImage } from "../primitives/LocalStorageImage";
import { CursorIcon } from "../primitives/icons/cursor";
import { EditIcon } from "../primitives/icons/edit";


const tabCascadeOffset = [10, 18, 25, 31]
const tabCascadeScale = [.95, .89, .83, .76]

export const WindowPreview: React.FC<{ window: TrackedWindow, }> = ({ window }) => {

  const tabs2 = useLiveQuery(
    window.status === "open" ?
      () => db.tabs.where("windowId").equals(window.id!).and(x => x.status === "open").toArray() as Promise<OpenVisit[]>
      : () => db.tabs.where("windowId").equals(window.id!).and(x => x.status === "closed" && x.closingReason === "window-closed").toArray() as Promise<OpenVisit[]>) || []

  const tabs = tabs2.sort((a, b) => a.position.index - b.position.index)

  let activeIndex = tabs.findIndex(t => t.state.active)
  if (activeIndex == -1) {
    activeIndex = 0
  }

  const leftTabs = tabs.slice(0, activeIndex)
  const rightTabs = tabs.slice(activeIndex + 1)
  const activeTab = tabs[activeIndex]

  return <>
    <div className={`flex flex-col group select-none cursor-pointer w-[24em]`}>
      <div className="relative w-[16em] aspect-[16/9] left-[4em]">

        {leftTabs.slice(-4).reverse().map((tab, i) => <LocalStorageImage srcKey={tab.metadata?.previewImage || "none"} alt="" className={`shadow-sm absolute top-0 w-[16em] bg-ramp-100 dark:bg-ramp-200 aspect-[16/9] border border-ramp-300 rounded-lg  object-cover`}
          style={{
            transform: `translateX(-${tabCascadeOffset[i]}%) scale(${tabCascadeScale[i]})`,
            zIndex: 10 - i,
          }}
        />
        )}

        <LocalStorageImage srcKey={activeTab?.metadata?.previewImage || "none"} alt="" className={`shadow-sm absolute top-0 w-[16em] bg-ramp-100 dark:bg-ramp-200 aspect-[16/9] border border-ramp-300 rounded-lg  object-cover`} style={
          {
            zIndex: 10
          }
        } />


        {rightTabs.slice(0, 4).map((tab, i) => <LocalStorageImage srcKey={tab.metadata?.previewImage || "none"} alt="" className={`shadow-sm absolute top-0 w-[16em] bg-ramp-100 dark:bg-ramp-200 aspect-[16/9] border border-ramp-300 rounded-md  object-cover`}
          style={{
            transform: `translateX(${tabCascadeOffset[i]}%) scale(${tabCascadeScale[i]})`,
            zIndex: 9 - i,

          }}
        />

        )}
      </div>


      <div className="flex-1 items-center mt-4">
        <div className="flex flex-row gap-x-2 items-baseline place-content-center">
          {window.focused && <CursorIcon className="w-3 h-3  text-focus " />}
          <span className="text-ellipsis whitespace-nowrap overflow-hidden text-base" >
            {(window).title || <span className="text-ramp-400 font-normal">Untitled window</span>}
          </span>
        </div>
        {/* {highlighted && <div className="mt-1 text-sm text-ramp-900">Enter to open, space to add to current window, tab to view sub-loci</div>} */}
      </div>
    </div >
  </>
}