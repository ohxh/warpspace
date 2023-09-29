// import { useSortable } from "@dnd-kit/sortable";
// import React from "react";
// import { animateLayoutChanges } from "./SortableTab";
// import { useGridFocus } from "./GridFocus";
// import { CSS, subtract } from '@dnd-kit/utilities';
// import { PlusIcon } from "@heroicons/react/24/solid";

// export const NewTabButton: React.FC<{ windowId: number, disabled?: boolean }> = ({ windowId, disabled }) => {
//   const {
//     transform,
//     transition,
//   } = useSortable({
//     id: `WINDOW_${windowId}_NEW_TAB`,
//     disabled: true,
//     animateLayoutChanges,
//   });

//   const { handleKeyDown, ref } = useGridFocus(`WINDOW_${windowId}_NEW_TAB`)

//   return <button
//     onClick={() => {
//       chrome.tabs.create({ active: true });
//     }}
//     className={`group tab outline-none flex flex-col`}
//     tabIndex={0}
//     ref={ref}
//     onKeyDown={handleKeyDown}
//     style={{
//       transition: transition,
//       transform: CSS.Translate.toString(transform),
//     }}
//   >
//     <div className={` transition-[color,opacity] ${disabled ? "opacity-0" : ""} gap-y-2 w-full grid-tab aspect-[16/9] border rounded-md border-ramp-300 hover:border-ramp-700 group-focus:border-ramp-700 border-dashed flex flex-col items-center place-content-center group-focus-visible:ring-3 ring-offset-2 ring-focus`}>
//       <PlusIcon className="text-ramp-500 group-hover:text-ramp-900 group-focus:text-ramp-900 w-5 h-5 transition-colors" />
//       <div className="text-ramp-600 group-hover:text-ramp-900 group-focus:text-ramp-900 transition-colors">New tab</div>
//     </div>
//   </button>
// }
