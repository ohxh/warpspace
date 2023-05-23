import { ChevronRightIcon, WindowIcon } from "@heroicons/react/24/outline";
import React from "react";
import { SearchActionResult } from "../../services/search/results";
import { Favicon } from "../primitives/Favicon";
import { FunctionIcon } from "../primitives/icons/function";

export const SearchContextChip: React.FC<{ item: SearchActionResult }> = ({ item }) => {
  return <div
    className={`py-2 text-base flex flex-row items-center gap-x-3`}
  >

    {item.type === "page" &&
      <Favicon url={item.item?.url || ""} />}
    {item.type === "command" && <FunctionIcon className="w-5 h-5 mt-0.5" />}
    {item.type === "window" && <WindowIcon className="w-5 h-5 mt-0.5" />}
    <h2 className="block text-base text-ramp-900 overflow-ellipsis whitespace-nowrap overflow-hidden max-w-[12em]">{item.title}</h2><ChevronRightIcon className="text-ramp-500 w-5" />
  </ div>
}