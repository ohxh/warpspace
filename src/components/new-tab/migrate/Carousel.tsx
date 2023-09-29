// import {
//   closestCenter, CollisionDetection,
//   defaultDropAnimation,
//   DndContext,
//   DragOverlay, getFirstCollision, KeyboardCode, KeyboardSensor,
//   MeasuringStrategy,
//   MouseSensor,
//   pointerWithin,
//   rectIntersection,
//   TouchSensor,
//   useSensor,
//   useSensors
// } from "@dnd-kit/core";
// import {
//   arrayMove,
//   horizontalListSortingStrategy,
//   rectSortingStrategy,
//   SortableContext
// } from "@dnd-kit/sortable";
// import { useMenuState } from "ariakit";
// import produce from "immer";
// import _ from "lodash";
// import React, {
//   RefObject,
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState
// } from "react";
// import { createPortal } from "react-dom";
// import { OpenVisit } from "../../../services/database/DatabaseSchema";
// import { OverviewTab } from "./OverviewTab";
// import { OverviewTabContextMenu } from "./OverviewTabContextMenu";
// import { GridFocusContext } from "./GridFocus";
// import { NewNoteButton } from "./NewNoteButton";
// import { NewTabButton } from "./NewTabButton";
// import { PlaceholderWindow } from "./PlaceholderWindow";
// import { customKeyboardCoordinateGetter, smoothScroll } from "./sortable-helpers";
// import { SortableTab } from "./SortableTab";

// const PLACEHOLDER_WINDOW_ID = "PLACEHOLDER_WINDOW_ID";

// export interface CarouselProps {
//   windows: HydratedSpace[];
//   setWindows: (x: HydratedSpace[]) => void
//   setDragging: (x: boolean) => void;

//   warpspaceOpen: boolean;

//   selection: number[];
//   scrollRef: RefObject<HTMLDivElement | null>

//   handleSelect: (tab: OpenVisit) => void;
//   handleSelectAll: () => void;
//   handleMouseRangeSelect: (tab: OpenVisit) => void;
//   handleKeyboardRangeSelect: (tab: OpenVisit) => void;
//   handleDelete: (tab: OpenVisit) => void;
//   handleClick: (tab: OpenVisit) => void;
//   handleClearSelection: () => void;
// }
// //@ts-ignore
// function keyChanges(base, object) {
//   const changes = {};
//   //@ts-ignore
//   function walkObject(base, object, path = '') {
//     for (const key of Object.keys(base)) {
//       const currentPath = path === ''
//         ? key
//         : `${path}.${key}`;

//       if (object[key] === undefined) {
//         //@ts-ignore
//         changes[currentPath] = '-';
//       }
//     }

//     for (const [key, value] of Object.entries(object)) {
//       const currentPath = Array.isArray(object)
//         ? path + `[${key}]`
//         : path === ''
//           ? key
//           : `${path}.${key}`;

//       if (base[key] === undefined) {
//         //@ts-ignore
//         changes[currentPath] = '+';
//       }
//       else if (value !== base[key]) {
//         if (typeof value === 'object' && typeof base[key] === 'object') {
//           walkObject(base[key], value, currentPath)
//         }
//         else {
//           //@ts-ignore
//           changes[currentPath] = object[key];
//         }
//       }
//     }
//   }

//   walkObject(base, object);

//   return changes
// }

// export const CarouselInner: React.FC<CarouselProps> = ({
//   windows,
//   setWindows,
//   setDragging,
//   warpspaceOpen,
//   selection,
//   scrollRef,
//   handleSelect,
//   handleSelectAll,
//   handleMouseRangeSelect,
//   handleKeyboardRangeSelect,
//   handleDelete,
//   handleClick,
//   handleClearSelection,
// }) => {
//   // const lastWindows = useRef<any>([])
//   // useEffect(() => {
//   //   // console.warn("windows changes", keyChanges(lastWindows.current, windows))
//   //   lastWindows.current = _.cloneDeep(windows);
//   // }, [windows, lastWindows])


//   // const renders = useRef(0);
//   // renders.current += 1;

//   const handleDeleteWithFocus = useCallback((t: OpenVisit, focusNextId?: number) => {
//     const toDelete = selection.includes(t.id!) ? selection : t.id!;

//     const focusedId = t.id;

//     if (focusNextId !== undefined && document.activeElement === tabRefs.current[t.id!])
//       tabRefs.current[focusNextId]?.focus()
//     handleDelete(t);
//   }, [handleDelete])


//   const [active, setActive] = useState(0);


//   useEffect(() => {
//     (async () => {
//       if (!windows || windows.length === 0)
//         return;

//       const x = await chrome.tabs.query({ currentWindow: true, active: true });
//       const active2 = windows.flatMap(w => w.tabs).find(t => t.chromeId === x[0].id)
//       if (active === active2?.id!)
//         return;

//       // alert("setActive" + active2?.id!)
//       setActive(active2?.id!);
//       // console.log("focusing", tabRefs.current[active2?.id ?? -1])
//       tabRefs.current[active2?.id ?? -1]?.scrollIntoView({
//         block: "center",
//         inline: "center",
//         behavior: "auto"
//       })
//       tabRefs.current[active2?.id ?? -1]?.focus({ preventScroll: true })
//     })();
//   }, [windows]);

//   const lastOverId = useRef<string | number | null>(null);
//   // ID of visit or window currently being dragged
//   const [draggingId, setDraggingId] = useState<string | number | null>(null);
//   const dragging = draggingId !== null;
//   const [dropping, setDropping] = useState(false);

//   const recentlyMovedToNewContainer = useRef(false);

//   /**
//    * Custom collision detection strategy optimized for multiple containers
//    *
//    * - First, find any droppable containers intersecting with the pointer.
//    * - If there are none, find intersecting containers with the active draggable.
//    * - If there are no intersecting containers, return the last matched intersection
//    *
//    */
//   const collisionDetectionStrategy: CollisionDetection = useCallback(
//     (args) => {
//       // Start by finding any intersecting droppable
//       const pointerIntersections = pointerWithin(args);
//       const intersections =
//         pointerIntersections.length > 0
//           ? // If there are droppables intersecting with the pointer, return those
//           pointerIntersections
//           : rectIntersection(args);
//       let overId = getFirstCollision(intersections, "id");

//       if (overId != null) {
//         if (windows.some((x) => -x.id === overId)) {
//           const containerItems = windows.find((x) => -x.id === overId)!.tabs;

//           // If a container is matched and it contains items (columns 'A', 'B', 'C')
//           if (containerItems.length > 0) {
//             // Return the closest droppable within that container
//             overId = closestCenter({
//               ...args,
//               droppableContainers: args.droppableContainers.filter(
//                 (container) =>
//                   container.id !== overId &&
//                   containerItems.some((x) => x.id === container.id)
//               ),
//             })[0]?.id;
//           }
//         }

//         lastOverId.current = overId;

//         return [{ id: overId }];
//       }

//       // When a draggable item moves to a new container, the layout may shift
//       // and the `overId` may become `null`. We manually set the cached `lastOverId`
//       // to the id of the draggable item that was moved to the new container, otherwise
//       // the previous `overId` will be returned which can cause items to incorrectly shift positions
//       if (recentlyMovedToNewContainer.current) {
//         lastOverId.current = draggingId;
//       }

//       // If no droppable is matched, return the last match
//       return lastOverId.current ? [{ id: lastOverId.current }] : [];
//     },
//     [draggingId, windows]
//   );

//   // TODO factor out focus manipulation to some other component
//   // Map of refs from tab IDs for manipulating focus
//   const tabRefs = useRef<Record<number | string, HTMLElement>>({});

//   // if (!warpspaceOpen) { 

//   // alert("inactivity focus")
//   // tabRefs.current[active]?.scrollIntoView({
//   //   block: "center",
//   //   inline: "center",
//   //   behavior: "auto"
//   // })
//   // }



//   const sensors = useSensors(
//     useSensor(MouseSensor, { activationConstraint: { distance: 1 } }),
//     useSensor(TouchSensor, { activationConstraint: { distance: 6 } }),
//     useSensor(KeyboardSensor, {

//       coordinateGetter: customKeyboardCoordinateGetter,
//       keyboardCodes: {
//         start: [KeyboardCode.Space],
//         cancel: [KeyboardCode.Esc],
//         end: [KeyboardCode.Space, KeyboardCode.Enter],
//       },
//     })
//   );

//   // Works on fake ids
//   const findContainer = (id: number) => {
//     if (windows.some((x) => x.id === -id)) {
//       return id;
//     }
//     return -windows.find((w) => w.tabs.some((t) => t.id === id))!.id;
//   };

//   const initialContainer = useMemo(
//     () => (draggingId ? findContainer(draggingId as number) : null),
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [draggingId]
//   );

//   // Filter items to only those not being dragged
//   function filterItems(items: OpenVisit[]) {
//     if (!dragging) {
//       return items;
//     }

//     return items.filter(
//       (t) => t.id === draggingId || !selection.some((x) => x === t.id)
//     );
//   }

//   const [offset, setOffset] = useState({ x: 0, y: 0 });

//   const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });

//   const focusRef = useRef<HTMLDivElement>()
//   const menu = useMenuState({
//     getAnchorRect: () => anchorRect, animated: true,
//     gutter: 8,
//     shift: 0,
//   });

//   const [contextMenuTabs, setContextMenuTabs] = useState<OpenVisit[]>([])

//   const [lastFocusedTab, setLastFocusedTab] = useState<number | undefined>(undefined)

//   useEffect(() => {
//     if (!menu.open && lastFocusedTab) {
//       setTimeout(() =>
//         tabRefs.current[lastFocusedTab]?.focus(), 11)

//       setLastFocusedTab(undefined)
//     }
//   }, [menu.open])


//   const handleContextMenu = useCallback((e: MouseEvent | KeyboardEvent, t: OpenVisit) => {

//     if (menu.open) {
//       menu.hide()
//     }

//     setTimeout(() => {
//       setLastFocusedTab(t.id)

//       if (dragging) return;

//       if (selection.includes(t.id!))
//         setContextMenuTabs(windows.flatMap(w => w.tabs).filter(tt => selection.includes(tt.id)))
//       else
//         setContextMenuTabs(windows.flatMap(w => w.tabs).filter(tt => tt.id === t.id))


//       //@ts-ignore
//       if ((!e.clientX || !e.clientY)) {

//         console.warn("QQQ", e.target)
//         const rect = (e.target as HTMLElement).getBoundingClientRect()
//         setAnchorRect({ x: rect.x + rect.width / 2, y: rect.y + rect.width / 2 })
//         menu.initialFocus

//       } else {
//         //@ts-ignore
//         setAnchorRect({ x: e.clientX, y: e.clientY })
//       }

//       menu.setAutoFocusOnShow(true)
//       menu.show()
//       focusRef.current?.focus()
//       menu.move(menu.first())
//     }, 1)
//   }, [windows, menu, selection])

//   const mouseDown = useRef<boolean>(false)
//   const [keyboardDragging, setKeyboardDragging] = useState(false);

//   // console.log("Carousel renders", windows.length)

//   return (<div
//     onPointerDownCapture={e => mouseDown.current = true}
//     onPointerUp={e => mouseDown.current = false}
//     onPointerCancel={e => mouseDown.current = false}
//     onKeyDown={(e) => {
//       if (e.key === "Escape") {
//         if (!dragging) handleClearSelection()
//       }
//     }}
//     className="min-h-full min-w-full w-max flex py-20 px-[50vw]"
//     style={{
//       paddingLeft: "var(--carousel-edge-padding)",
//       paddingRight: "var(--carousel-edge-padding)",
//     }}
//   >
//     <OverviewTabContextMenu
//       handleClose={() => { }}
//       state={menu} selection={contextMenuTabs} innerRef={focusRef} />
//     {/* <div className="fixed top-2 mx-auto z-10 rounded bg-black text-white font-medium text-sm px-4 py-2">{renders.current} renders, {draggingId} draggingId, {lastSelected?.id ?? "no last selected"}, {dropping ? "dropping" : "note"}, {recentlyMovedToNewContainer.current ? "rmtnc" : "not"}, {lastSelected?.id}, {lastOverId.current}</div> */}
//     <DndContext
//       autoScroll={false}
//       sensors={sensors}
//       collisionDetection={collisionDetectionStrategy}
//       measuring={{
//         droppable: {
//           strategy: MeasuringStrategy.Always,
//         },
//       }}
//       onDragStart={({ active, }) => {
//         menu.hide()
//         setDragging(true);
//         if (!mouseDown.current) {
//           setKeyboardDragging(true)
//         }

//         if (selection.length > 1 && selection.some(t => t === active.id)) {
//           const first = windows
//             .find((w) => -w.id === findContainer(selection[0]))
//             ?.tabs!.find((t) => selection.some((tt) => tt === t.id));
//           const firstRec =
//             tabRefs.current[first!.id!].getBoundingClientRect();
//           const toRec =
//             tabRefs.current[active.id as number].getBoundingClientRect();
//           setOffset({ x: toRec.x - firstRec.x, y: toRec.y - firstRec.y });
//         }
//         if (!selection.includes(active.id as number)) {
//           handleClearSelection()
//         }
//         setDraggingId(active.id);
//         setDropping(false);
//       }}

//       onDragOver={({ active, over }) => {
//         if (over?.id.toString().startsWith("WINDOW"))
//           return;
//         const overId = over?.id;

//         if (!overId || windows.some((x) => -x.id === active.id)) {
//           return;
//         }

//         const overContainer = findContainer(overId as number);
//         const activeContainer = findContainer(active.id as number);

//         if (!overContainer || !activeContainer) {
//           return;
//         }

//         if (activeContainer !== overContainer) {
//           setWindows(
//             produce(windows!, (draft) => {
//               const activeItems = draft!.find(
//                 (x) => x.id === -activeContainer
//               )!.tabs;
//               const overItems = filterItems(
//                 draft!.find((x) => x.id === -overContainer)!.tabs
//               );

//               const overIndex = overItems.findIndex((x) => x.id === overId);
//               const activeIndex = activeItems.findIndex(
//                 (x) => x.id === active.id
//               );

//               let newIndex: number;

//               if (draft!.some((x) => x.id === overId)) {
//                 newIndex = overItems.length + 1;
//               } else {
//                 const isBelowOverItem =
//                   over &&
//                   active.rect.current.translated &&
//                   active.rect.current.translated.top >
//                   over.rect.top + over.rect.height;

//                 const modifier = isBelowOverItem ? 1 : 0;

//                 newIndex =
//                   overIndex >= 0
//                     ? overIndex + modifier
//                     : overItems.length + 1;
//               }

//               recentlyMovedToNewContainer.current = true;

//               draft!.find((x) => x.id === -activeContainer)!.tabs =
//                 activeItems.filter((item) => item.id !== active.id);

//               draft!
//                 .find((x) => x.id === -overContainer)!
//                 .tabs.splice(newIndex, 0, activeItems[activeIndex]);
//             })
//           );
//         }
//       }}
//       onDragEnd={({ active, over }) => {
//         setOffset({ x: 0, y: 0 });
//         setDragging(false)
//         setKeyboardDragging(false)
//         setDropping(true);

//         if (windows.some((x) => -x.id === active.id) && over?.id) {
//           const activeIndex = windows!.findIndex((x) => -x.id === active.id);
//           const overIndex = windows!.findIndex((x) => -x.id === over.id);
//           setWindows(arrayMove(windows!, activeIndex, overIndex));
//           return;
//         }

//         const activeContainer = findContainer(active.id as number);
//         const overId = over?.id;

//         if (!activeContainer || !overId || !initialContainer) {
//           setDraggingId(null);
//           handleClearSelection()
//           return;
//         }

//         // Put active ID first
//         const ids = selection.length
//           ? [
//             active.id,
//             ...selection
//               .filter((id) => id !== active.id)
//           ]
//           : [active.id];

//         if (overId === PLACEHOLDER_WINDOW_ID) {
//           alert("TODO drag to placeholder");
//           return;
//         }

//         const overContainer = findContainer(overId as number);

//         if (overContainer) {
//           const overItems = filterItems(
//             windows.find((x) => -x.id === overContainer)!.tabs
//           );
//           const overIndex = overItems.findIndex((x) => x.id === overId);
//           const activeIndex = overItems.findIndex((x) => x.id === active.id);
//           const newItems = arrayMove(overItems, activeIndex, overIndex);
//           const newActiveIndex = newItems.findIndex(
//             (x) => x.id === active.id
//           );

//           setWindows(
//             produce(windows, (draft) => {
//               const allTabs = draft.map((x) => x.tabs).flat();

//               // remove selection from all sources
//               draft.forEach(
//                 (w) =>
//                   (w.tabs = w.tabs.filter((item) => !ids.includes(item.id)))
//               );

//               draft
//                 .find((x) => -x.id === overContainer)!
//                 .tabs.splice(
//                   newActiveIndex,
//                   0,
//                   ...allTabs.filter((x) => ids.includes(x.id))
//                 );
//             })
//           );
//         } else {
//           alert("Not overContainer");
//         }

//         setDraggingId(null);

//         setTimeout(() => {

//           //setFocused(active.id as number)
//           // alert(tabRefs.current[active.id as number].parentNode)
//           tabRefs.current[active.id as number].focus({
//             preventScroll: true
//           })
//           //@ts-ignore
//           // smoothScroll(tabRefs.current[active.id as number].parentNode);
//         }, 200);
//       }}
//       // cancelDrop={cancelDrop}
//       onDragCancel={() => {
//         // alert("cancelled drag!");
//         setKeyboardDragging(false)
//         setDragging(false);
//         setDraggingId(null);
//       }}
//     // modifiers={modifiers}
//     >
//       <SortableContext
//         items={[...windows.map((w) => -w.id), PLACEHOLDER_WINDOW_ID]}
//         strategy={horizontalListSortingStrategy}
//       >
//         <GridFocusContext enabled={!dragging}>
//           <div className="flex">
//             {windows.map((w) => (
//               <OverviewSpace
//                 key={w.id}
//                 space={w}
//               >
//                 <SortableContext
//                   items={[...(filterItems([...w.tabs]) as { id: number }[]).map(
//                     (t) => t.id
//                   ), `WINDOW_${w.id}_NEW_TAB`, `WINDOW_${w.id}_NEW_NOTE`]}
//                   strategy={rectSortingStrategy}
//                 >
//                   {filterItems(w.tabs).map((t, i) => (
//                     <SortableTab
//                       setRef={(e) => tabRefs.current[t.id!] = e}
//                       menuOpen={lastFocusedTab === t.id}
//                       current={active === t.id}

//                       handleSelect={handleSelect}
//                       handleKeyboardRangeSelect={handleKeyboardRangeSelect}
//                       handleMouseRangeSelect={handleMouseRangeSelect}
//                       handleClearSelection={handleClearSelection}
//                       handleDelete={handleDeleteWithFocus}
//                       handleClick={handleClick}
//                       handleContextMenu={handleContextMenu}

//                       key={t.id}

//                       focusNextId={(w.tabs[i + 1] ?? w.tabs[i - 1])?.id}
//                       tab={t}
//                       disabled={dragging}
//                       containingSelection={
//                         selection.some((x) => x === t.id)
//                           ? selection
//                           : undefined
//                       }
//                     />
//                   ))}
//                   <NewTabButton windowId={w.id!} disabled={dragging} />
//                   <NewNoteButton windowId={w.id!} disabled={dragging} />
//                 </SortableContext>
//               </OverviewSpace>
//             ))}
//             <SortableContext items={[]}>
//               <PlaceholderWindow />
//             </SortableContext>
//           </div>
//         </GridFocusContext>
//       </SortableContext>

//       {/* Clone of dragged item while in motion */}
//       {createPortal(
//         <div className={dropping ? "drop-animation-active" : ""}>
//           <DragOverlay
//             adjustScale={false}
//             dropAnimation={{ ...defaultDropAnimation }}
//           >
//             {dragging && (
//               <div style={{
//                 transform: `translateX(${offset.x}px) translateY(${offset.y}px)`,
//               }}>
//                 <OverviewTab
//                   current={active === draggingId}
//                   key={"dragging"}
//                   dragging={true}
//                   hidden={false}
//                   tab={
//                     windows
//                       .map((x) => x.tabs)
//                       .flat()
//                       .find((x) => x.id === draggingId)!
//                   }
//                   containingSelection={
//                     selection.some((x) => x === draggingId)
//                       ? selection
//                       : undefined
//                   }
//                 /></div>
//             )}
//           </DragOverlay>
//         </div>,
//         document.body
//       )}
//     </DndContext>
//     <div className="fixed top-[8] left-[50vw] translate-x-[-50%] transition-opacity text-base bg-black/70 text-white px-4 py-2 rounded" style={{ opacity: keyboardDragging ? 1 : 0 }}>Dragging, press space to drop</div>
//   </div>
//   );
// };

// export const Carousel = React.memo(CarouselInner);
