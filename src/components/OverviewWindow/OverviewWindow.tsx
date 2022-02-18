import { DotsHorizontalIcon, DotsVerticalIcon, PlusIcon, StarIcon, XIcon } from "@heroicons/react/outline";
import { StarIcon as StarIconFilled } from "@heroicons/react/solid";
import { useDebounce } from "@react-hook/debounce";

import React, { useEffect, useState } from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import { ReactSortable } from "react-sortablejs";
import Sortable, { AutoScroll, MultiDrag } from "sortablejs";
import { HydratedWindow } from "../../services/TabStore";
import { EditableText } from "../Window/EditableText";
import "./tab-grid.css"

Sortable.mount(new MultiDrag())


export const StarIcon2: React.FC<{}> = ({ }) => {
  const [ticked, setTicked] = useState(false)

  const [pinging, setPinging, setPingingImmediate] = useDebounce(false, 1000)
  const tick = () => {
    setTicked(true)
    setPinging(false)
    setPingingImmediate(true)
  }
  return <button onClick={() => { if (ticked) setTicked(!ticked); else tick(); }} className="relative px-1 py-1 rounded-sm active:bg-gray-100">
    {!ticked && <StarIcon className="w-4 h-4 text-gray-500" />}
    {ticked && <StarIconFilled className="w-4 h-4 text-yellow" />}
    {pinging && <div className="absolute inset-0 p-1"><StarIconFilled className="m-auto w-h h-5 text-yellow animate-ping" /></div>}
  </button>
}


export const OverviewWindow: React.FC<{ data: HydratedWindow }> = ({ data, children }) => {

  const [title, setTitle] = useState<string | undefined>("")
  return <div
    // `window` class adds complicated styling from window.css to deal with
    // consistent tab sizes, as determined by the window grid and elsewhere
    className="snap-center window mt-8">
    <div className="pb-10 flex items-baseline space-x-4">
      <EditableText placeholder="Untitled space" value={title} onChange={setTitle} />
      {/* : <h1 className="text-4xl text-gray-400 ">Unnamed Window</h1>} */}
      <div className="flex-1" />
      <div className="group text-[15px] text-gray-600 transition-opacity  flex items-center">

        <button className="px-1 py-1 rounded-sm active:bg-gray-100"><DotsHorizontalIcon className="w-4 h-4 text-gray-500" /></button>
        <StarIcon2 />
        <button className="px-1 py-1 rounded-sm active:bg-gray-100"><XIcon className="w-4 h-4 text-gray-500" /></button>
      </div>

    </div>


    {children}


  </div >
}