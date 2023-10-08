import React from "react";
import { PageSearchActionResult } from "../../../services/search/results";
import { ClockIcon } from "@heroicons/react/20/solid";
import { SmartFavicon } from "../../primitives/Favicon";
import { CursorIcon } from "../../primitives/icons/cursor";
import { TabPreview } from "./TabPreview";
import { highlightChildren } from "./highlightChildren";
import { currentTabId } from "../../../utils/currentTabId";
import { humanReadableTimeAgo } from "../../../utils/time";
import { WindowLink } from "./WindowLink";

export const PageSearchPreview: React.FC<{ result: PageSearchActionResult }> = ({ result }) => {
  return <div className="px-4 py-4">
    <TabPreview tab={result.item} />
    <div className="flex-1 min-w-0 mt-2">
      <div className="flex flex-row gap-x-2 items-center px-[0.125rem] ">
        <h2 className={`text-base text-ramp-900 overflow-ellipsis ${result.title?.includes(" ") ? "break-words" : "break-all"}`}>
          <div className="float-left mt-[0.1875rem] align-middle w-[1.125rem] h-[1.125rem] rounded-sm leading-none mr-2" ><SmartFavicon item={result.item} /></div>
          {highlightChildren(result.title, result.debug.regex)}
        </h2>

      </div>
      <p className="mt-1 text-xs text-ramp-500 break-all max-lines-3 overflow-clip">
        {highlightChildren(result.url, result.debug.regex)}
      </p>

      <div className="mt-2 flex flex-col gap-y-1">
        {result.visits.sort((a, b) => {
          // Active -> most recently opened -> most recently closed
          if (a.status === "open" && a.chromeId === currentTabId) return -1
          else if (b.status === "open" && b.chromeId === currentTabId) return 1
          else if (b.status === "open" && a.status === "open") return b.openedAt.getTime() - a.openedAt.getTime()
          else if (a.status === "open") return -1
          else if (b.status === "open") return 1
          else return b.closedAt.getTime() - a.closedAt.getTime()
        }).map(v => <div className="text-xs flex flex-row items-baseline">
          {v.status === "open" && v.chromeId !== currentTabId && <div className="inline bg-highlightFaint px-1.5 py-0.5 rounded-sm text-xs text-ramp-800 mr-1"><div className="w-1.5 h-1.5 bg-focus rounded-full inline-block align-[10%] mr-1" /> Open now</div>}
          {v.status === "open" && v.chromeId == currentTabId && <div className="inline bg-highlightFaint px-1.5 py-0.5 rounded-sm text-xs text-ramp-800 mr-1"> <CursorIcon className=" w-2 h-2  text-focus inline align-baseline mr-1" /> Current tab </div>}
          {v.status === "closed" && <div className="inline text-xs text-ramp-800 mr-1"> <ClockIcon className="w-3 h-3 text-ramp-700 inline mr-1" /> open {humanReadableTimeAgo(v.closedAt)}</div>}
          in <WindowLink id={v.windowId} />
        </div>)}
      </div>
    </div>
  </div >
}