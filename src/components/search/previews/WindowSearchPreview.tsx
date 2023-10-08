import { ClockIcon } from "@heroicons/react/20/solid";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { TrackedWindow, db, OpenVisit, useLiveValue } from "../../../services/database/DatabaseSchema";
import { currentTabId } from "../../../utils/currentTabId";
import { humanReadableTimeAgo } from "../../../utils/time";
import { CursorIcon } from "../../primitives/icons/cursor";
import { TabPreview } from "./TabPreview";
import { StarIcon } from "../../primitives/icons/star";
import { EditIcon } from "../../primitives/icons/edit";
import { EditableText } from "../../primitives/EditableText";

export const WindowSearchPreview: React.FC<{ space: TrackedWindow, }> = ({ space, }) => {
  const window = useLiveValue(space)

  const tabs2 = useLiveQuery(
    window.status === "open" ?
      () => db.tabs.where("windowId").equals(window.id!).and(x => x.status === "open").toArray() as Promise<OpenVisit[]>
      : () => db.tabs.where("windowId").equals(window.id!).and(x => x.status === "closed" && x.closingReason === "window-closed").toArray() as Promise<OpenVisit[]>, [window])

  const tabs = tabs2 ? [...tabs2.filter(t => t.metadata.previewImage), ...tabs2.filter(t => !t.metadata.previewImage)] : [];

  const current = tabs2?.some(t => t.chromeId === currentTabId)

  return <>
    <div className="relative z-10">
      {tabs[0] &&
        <TabPreview tab={tabs[0]} />}
      {tabs.slice(1).map((t, i) => <div className={`absolute top-0 left-0 w-[16em] origin-center hover:z-10 hover:scale-100 transition-all`} style={{ transform: `translateX(${[32, 58, 86, 110][i]}px) scale(${[95, 89, 83, 76][i]}%)`, zIndex: -(i + 1) }}>
        <TabPreview tab={t} />
      </div>)}
    </div>

    <div className="space-y-2 flex-1 min-w-0 mt-2"
      onKeyDownCapture={e => e.stopPropagation()}
      onKeyUpCapture={e => e.stopPropagation()}
    >
      <div className="flex flex-row gap-x-2 items-center px-[0.125rem] ">

        <h2 className={`text-base text-ramp-900 overflow-ellipsis ${window.title?.includes(" ") ? "break-words" : "break-all"}`}>
          <EditableText value={window.title} onChange={async (title) => {
            await db.windows.update(window.id, {
              title
            })
          }}>
            {window.title}
            {!window.title && <span className={`text-base text-ramp-500 overflow-ellipsis ${window.title?.includes(" ") ? "break-words" : "break-all"}`}>
              Untitled Window
            </span>}
          </EditableText>
        </h2>

        {/* <StarIcon className="text-ramp-500 w-4 h-4" /> */}
      </div>
      <p className="text-xs text-ramp-500 break-all max-lines-3 overflow-hidden">

      </p>

      {window.status === "open" && !current && <div className="inline bg-highlightFaint px-1.5 py-0.5 rounded-sm text-xs text-ramp-800 mr-1"><div className="w-1.5 h-1.5 bg-focus rounded-full inline-block align-[10%] mr-1" /> Open now</div>}
      {window.status === "open" && current && <div className="inline bg-highlightFaint px-1.5 py-0.5 rounded-sm text-xs text-ramp-800 mr-1"> <CursorIcon className=" w-2 h-2  text-focus inline align-baseline mr-1" /> Current window</div>}
      {window.status === "closed" && <div className="inline text-xs text-ramp-800 mr-1"> <ClockIcon className="w-3 h-3 text-ramp-700 inline mr-1" /> open {humanReadableTimeAgo(window.closedAt!)}</div>}

    </div>

  </>
}

/*

Cmd + click = edit selection

*/