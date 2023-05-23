
import { LockClosedIcon } from "@heroicons/react/20/solid";
import React, { forwardRef } from "react";
import { OpenVisit, Page, TrackedVisit } from "../../../services/database/DatabaseSchema";
import { Favicon } from "../../primitives/Favicon";
import { LocalStorageImage } from "../../primitives/LocalStorageImage";

export interface TabPreviewProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  tab: TrackedVisit | Page;
}

export const TabPreview = forwardRef<HTMLDivElement, TabPreviewProps>(({ tab, }, ref) => {


  return <div
    className={`
      relative max-w-[16em] aspect-[16/9] cursor-default  group
       bg-ramp-100 rounded-md ring-offset-2 ring-focus
      
       `}
  >
    <div className="absolute inset-0 rounded-md opacity-20  ">
      <Favicon url={tab.url}
        className="w-8 max-w-[30%] -translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 rounded"
      />
    </div>

    <LocalStorageImage
      srcKey={
        tab.metadata.previewImage || "none"
      }
      className={` absolute inset-0 
      rounded-md border border-ramp-300 dark:border-ramp-200
      object-cover object-left-top h-full w-full
   
      `}
    />

    {/* @ts-ignore */}
    {tab.open === "true" && tab.position.pinned && (
      <button
        onClick={(e) => e.stopPropagation()}
        className="active:bg-black/10 p-1 absolute top-1 left-1 z-50 rounded-full"
      >
        <LockClosedIcon className="text-focus rounded-full w-3 h-3"></LockClosedIcon>
      </button>
    )}
    {/* <div className="absolute inset-0 rounded-md border border-ramp-300 dark:border-ramp-100 sortable-drag:border-ramp-400"></div> */}
    {/* {current && <div className=" absolute top-2 right-2"><CursorIcon className=" w-3 h-3 text-focus" /></div>} */}

  </div>
})
