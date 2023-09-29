// import { AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable } from "@dnd-kit/sortable";
// import { CSS } from '@dnd-kit/utilities';
// import React, { useCallback, useState } from "react";
// import { OpenVisit } from "../../../services/database/DatabaseSchema";
// import { OverviewTab } from "../OverviewTab/OverviewTab";
// import { useGridFocus } from "./GridFocus";


// export const animateLayoutChanges: AnimateLayoutChanges = (args) => {
//   const { isSorting, isDragging, wasDragging } = args;

//   if (wasDragging) {
//     return defaultAnimateLayoutChanges(args);
//   }
//   return true;
// }

// export interface SortableTabProps {

//   tab: OpenVisit,

//   setRef?: (x: HTMLElement) => void;
//   current: boolean;
//   containingSelection?: number[];

//   disabled: boolean
//   menuOpen?: boolean;
//   focusNextId: number;

//   handleContextMenu: (e: MouseEvent | KeyboardEvent, t: OpenVisit) => void;
//   handleSelect: (tab: OpenVisit) => void;
//   handleMouseRangeSelect: (tab: OpenVisit) => void;
//   handleKeyboardRangeSelect: (tab: OpenVisit) => void;
//   handleDelete: (tab: OpenVisit, focusNextId?: number) => void;
//   handleClick: (tab: OpenVisit) => void;
//   handleClearSelection: () => void;
// }

// const SortableTabInner: React.FC<SortableTabProps> = ({ focusNextId, menuOpen, handleContextMenu, current, tab, setRef, containingSelection, handleSelect, handleKeyboardRangeSelect, handleMouseRangeSelect, handleDelete, handleClearSelection, handleClick, disabled, }) => {
//   const { ref: gridFocusRef, handleKeyDown } = useGridFocus(tab.id!)

//   const {
//     setNodeRef,
//     listeners,
//     attributes,
//     isDragging,
//     transform,
//     transition,
//   } = useSortable({
//     disabled: tab.position.pinned,
//     animateLayoutChanges,
//     id: tab.id!,
//   });

//   const [closing, setClosing] = useState(false)

//   const handleDelete2 = useCallback((x: OpenVisit) => {
//     setClosing(true);
//     handleDelete(x, focusNextId)
//   }, [handleDelete, focusNextId]);

//   const hidden = isDragging;
//   const selected = !!containingSelection;

//   return <div
//     {...listeners}
//     {...attributes}
//     //@ts-ignore
//     onContextMenu={e => handleContextMenu(e, tab)}
//     onMouseDown={e => {
//       if (!e.altKey && !e.ctrlKey && e.metaKey && !e.shiftKey && !disabled && !tab.position.pinned)
//         handleSelect(tab)
//       else if (!e.altKey && !e.ctrlKey && !e.metaKey && e.shiftKey && !disabled && !tab.position.pinned)
//         handleMouseRangeSelect(tab)
//       else
//         listeners?.onMouseDown(e)
//       e.stopPropagation()
//     }}
//     onClick={(e) => {
//       if (!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && !disabled)
//         handleClick(tab)
//       else
//         listeners?.onClick?.(e)
//     }}
//     onKeyDown={e => {
//       if (e.key === "Enter" && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && !disabled)
//         handleClick(tab)
//       else if (e.key === "Enter" && !e.altKey && !e.ctrlKey && e.metaKey && !e.shiftKey && !disabled && !tab.position.pinned)
//         handleSelect(tab)
//       else if (e.key === "Enter" && !e.altKey && !e.ctrlKey && !e.metaKey && e.shiftKey && !disabled && !tab.position.pinned)
//         handleKeyboardRangeSelect(tab)
//       else if (e.key === "c" && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && !disabled)
//         handleContextMenu(e as any, tab)
//       else if ((e.key === "Delete" || e.key == "Backspace") && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey && !disabled) {
//         setClosing(true)
//         handleDelete2(tab)
//       }
//       else {
//         handleKeyDown(e)
//         listeners?.onKeyDown(e)
//       }
//     }}
//     className={`${disabled ? "" : "group"} tab relative outline-none
//     ${selected ? "sortable-selected" : ""}
//     ${hidden ? "opacity-0" : ""}`}
//     tabIndex={disabled ? undefined : 0}
//     ref={r => { if (!tab.position.pinned) setNodeRef?.(r); setRef?.(r!); gridFocusRef(r); }}
//     style={{
//       transition: transition,
//       transform: CSS.Translate.toString(transform),
//     }}
//   >
//     <OverviewTab
//       tab={tab}
//       current={current}
//       key={tab.id}
//       menuOpen={menuOpen}
//       containingSelection={containingSelection}
//       dragging={false}
//       closing={closing}
//       handleDelete={handleDelete2}
//     />
//   </div>
// }

// export const SortableTab = React.memo(SortableTabInner)