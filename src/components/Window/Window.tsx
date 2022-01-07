import { DotsHorizontalIcon, DotsVerticalIcon, PlusIcon, StarIcon, XIcon } from "@heroicons/react/outline";
import React, { useState } from "react";
import { Flipped, Flipper } from "react-flip-toolkit";
import Sortable, { MultiDrag } from "sortablejs";
import { HydratedWindow } from "../../services/TabStore";
import { EditableText } from "./EditableText";
import { Tab } from "./Tab";
import "./window.css"

Sortable.mount(new MultiDrag())

export const WWindow: React.FC<{ data: HydratedWindow }> = ({ data }) => {

  const [title, setTitle] = useState<string | undefined>("")
  return <div
    // `window` class adds complicated styling from window.css to deal with
    // consistent tab sizes, as determined by the window grid and elsewhere
    className="snap-center window mt-8">
    <div className="pb-8 flex items-baseline">

      <EditableText placeholder="Untitled window" value={title} onChange={setTitle} />
      {/* : <h1 className="text-4xl text-gray-400 ">Unnamed Window</h1>} */}
      <div className="flex-1" />
      <div className="text-[15px] text-gray-600 transition-opacity opacity-0 group-hover:opacity-100 flex items-center">

        <button className="px-1 py-1 rounded-sm hover:bg-gray-200"><DotsHorizontalIcon className="w-h h-5 text-gray-500" /></button>
        <button className="px-1 py-1 rounded-sm hover:bg-gray-200"><StarIcon className="w-h h-5 text-gray-500" /></button>
        <button className="px-1 py-1 rounded-sm hover:bg-gray-200"><XIcon className="w-h h-5 text-gray-500" /></button>
      </div>

    </div>
    <Flipper flipKey={data.tabs.map(m => m.id).join('-')} spring={{ stiffness: 600, damping: 50 }}>
      <div
        className="tab-grid">
        {data.tabs.map((tab, i) =>
          <Flipped key={tab.id} flipId={tab.id}>
            <div>
              <Tab tab={tab} />
            </div>
          </Flipped>
        )}
        <div className="grid-tab">
          <div className={`aspect-[16/9] w-full border border-dashed border-gray-300 rounded-md flex hover:bg-gray-100`} style={{ borderStyle: "d" }}>

            <div className="m-auto text-gray-600 items-center flex flex-col">
              <PlusIcon className="w-5 h-5 mb-2" />
              New tab
            </div>
          </div>

        </div>

      </div>
    </Flipper>
  </div>
}