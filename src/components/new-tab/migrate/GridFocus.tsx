// import React, { useContext, useRef, KeyboardEvent } from "react";
// import { smoothScroll } from "./sortable-helpers";

// const gridFocusContext = React.createContext<GridFocusState | null>(null);

// interface GridFocusState {
//   setNodeRef: (id: string | number, e: HTMLElement) => void;
//   nodeRefs: React.MutableRefObject<Record<number | string, HTMLElement>>;
//   enabled: boolean;
// }

// export const useGridFocus = (id: string | number) => {
//   const ctx = useContext(gridFocusContext);
//   const { setNodeRef, nodeRefs } = ctx!;

//   const handleKeyDown = (e: KeyboardEvent) => {
//     if (!ctx?.enabled) return;

//     let direction: "up" | "down" | "left" | "right"
//     if (e.key === "ArrowLeft") {
//       direction = "left"
//     } else if (e.key === "ArrowRight") {
//       direction = "right"
//     } else if (e.key === "ArrowUp") {
//       direction = "up"
//     } else if (e.key === "ArrowDown") {
//       direction = "down"
//     } else {
//       return
//     }

//     const current = nodeRefs.current[id]!

//     const currentRect = current.getBoundingClientRect()
//     const rects = Object.keys(nodeRefs.current).map(k => [k, nodeRefs.current[k].getBoundingClientRect()] as const);

//     const filtered = rects.filter(r => {
//       if (direction === "left") {
//         return r[1].right <= currentRect.left
//       } else if (direction === "right") {
//         return r[1].left >= currentRect.right
//       } else if (direction === "up") {
//         return r[1].bottom <= currentRect.top
//       } else if (direction === "down") {
//         return r[1].top >= currentRect.bottom
//       }
//     });

//     e.preventDefault()
//     e.stopPropagation()

//     const dist = (x: DOMRect, y: DOMRect) => {
//       return ((x.left + x.right) / 2 - (y.left + y.right) / 2) ** 2 + ((x.top + x.bottom) / 2 - (y.top + y.bottom) / 2) ** 2
//     }

//     let closestDist = 999999999999;
//     let closestId: number | string | null = null;

//     filtered.forEach(r => {
//       let distance = dist(r[1], currentRect);
//       if (distance < closestDist) {
//         closestDist = distance;
//         closestId = r[0]
//       }
//     });

//     if (!closestId) throw new Error("No closest node found")

//     nodeRefs.current[closestId].focus({
//       preventScroll: true,
//     });
//     smoothScroll(nodeRefs.current[closestId].parentElement!)

//     const targetNode = nodeRefs.current[closestId];

//     if (e.shiftKey) {
//       const event = new MouseEvent('click', {
//         view: window,
//         bubbles: true,
//         cancelable: true
//       });
//     }
//   }

//   const ref = (e: HTMLElement | null) => {
//     if (e) setNodeRef(id, e)
//   }

//   return {
//     handleKeyDown,
//     ref,
//   }
// };

// export const GridFocusContext: React.FC<{ enabled: boolean, children: React.ReactNode }> = ({ children, enabled }) => {

//   const nodeRefs = useRef<Record<number | string, HTMLElement>>({})

//   return <gridFocusContext.Provider value={{
//     setNodeRef: (id, el) => nodeRefs.current[id] = el,
//     nodeRefs: nodeRefs,
//     enabled: enabled,
//   }}>
//     {children}
//   </gridFocusContext.Provider>
// }