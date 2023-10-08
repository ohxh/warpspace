import { ChevronRightIcon, WindowIcon } from "@heroicons/react/24/outline";
import React from "react";
import { SearchActionResult } from "../../services/search/results";
import { Favicon, SmartWindowIcon } from "../primitives/Favicon";
import { FunctionIcon } from "../primitives/icons/function";
import { SelectionContext } from "./SearchBar";

export const SearchContextChip: React.FC<{ item: SearchActionResult | SelectionContext }> = ({ item }) => {
  if (item.type === "selection") return <div className="flex flex-row gap-x-3">
    <div className="bg-highlightFaint rounded-md px-2 py-1 flex flex-row gap-x-3">
      {item.selection.slice(0, 5).map((s, i) => <Favicon url={s?.url || ""} />)}
      {item.selection.length == 1 && <>1 tab</>}
      {item.selection.length > 1 && <>{item.selection.length} tabs</>}
    </div>
    <ChevronRightIcon className="text-ramp-500 w-5" />
  </div>

  return <div
    className={`py-2 text-base flex flex-row items-center gap-x-3`}
  >
    {item.type === "page" &&
      <Favicon url={item.item?.url || ""} />}
    {item.type === "command" && <FunctionIcon className="w-5 h-5 mt-0.5" />}
    {item.type === "window" && <SmartWindowIcon window={item.item} />}
    {item.type === "window" && !item.title && <h2 className="block text-base text-ramp-500 overflow-ellipsis whitespace-nowrap overflow-hidden max-w-[12em]">Untitled window</h2>}
    {item.title && <h2 className="block text-base text-ramp-900 overflow-ellipsis whitespace-nowrap overflow-hidden max-w-[12em]">{item.title}</h2>}

    <ChevronRightIcon className="text-ramp-500 w-5" />
  </ div>
}