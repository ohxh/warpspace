import { XMarkIcon } from "@heroicons/react/20/solid";
import React from "react";
import { useSetting, useUpdateSetting } from "../../hooks/useSetting";
import { KeyCap } from "../primitives/KeyCap";

export const SearchHelpBar: React.FC<{}> = ({ }) => {
  const dismissed = useSetting("search.helpBarDismissed")
  const dismiss = useUpdateSetting("search.helpBarDismissed")

  if (dismissed) return <></>

  return <div className="select-none w-full pl-4 py-1 mt-1 flex flex-row items-center text-ramp-500 text-sm"><div className='text-left flex-1'><KeyCap>↑</KeyCap> <KeyCap>↓</KeyCap> to select, <KeyCap>?</KeyCap> for help</div> <button
    tabIndex={-1}
    className="rounded-full p-1 tab-x-button active:bg-ramp-100 mx-2"
    onClick={() => dismiss(true)}
  >
    <XMarkIcon className="w-3.5 h-3.5 text-ramp-800" />
  </button>
  </div>
}