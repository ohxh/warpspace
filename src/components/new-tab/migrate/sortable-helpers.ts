// import {
//   KeyboardCode,
//   KeyboardCoordinateGetter,
//   closestCorners,
//   getFirstCollision,
//   getScrollableAncestors,
// } from "@dnd-kit/core";
// import { subtract } from "@dnd-kit/utilities";

// let scrollingTo: HTMLElement | undefined = undefined;

// export function smoothScroll(x: HTMLElement) {
//   const rect = x.getBoundingClientRect();

//   if (
//     (rect.x < 0 ||
//       rect.y < 0 ||
//       rect.x + rect.width > window.innerWidth ||
//       rect.y + rect.height > window.innerHeight) &&
//     scrollingTo !== x
//   ) {
//     (x as HTMLElement).scrollIntoView({
//       behavior: "smooth",
//       block: "center",
//       inline: "center",
//     });
//     scrollingTo = x;
//     setTimeout(() => {
//       scrollingTo = undefined;
//     }, 1000);
//   }
// }

// export const directions: string[] = [
//   KeyboardCode.Down,
//   KeyboardCode.Right,
//   KeyboardCode.Up,
//   KeyboardCode.Left,
// ];

// export function hasSortableData(entry: any) {
//   if (!entry) {
//     return false;
//   }

//   const data = entry.data.current;

//   if (
//     data &&
//     "sortable" in data &&
//     typeof data.sortable === "object" &&
//     "containerId" in data.sortable &&
//     "items" in data.sortable &&
//     "index" in data.sortable
//   ) {
//     return true;
//   }

//   return false;
// }

// export function isSameContainer(a: any, b: any) {
//   if (!hasSortableData(a) || !hasSortableData(b)) {
//     return false;
//   }

//   return (
//     a.data.current.sortable.containerId === b.data.current.sortable.containerId
//   );
// }

// export function isAfter(a: any, b: any) {
//   if (!hasSortableData(a) || !hasSortableData(b)) {
//     return false;
//   }

//   if (!isSameContainer(a, b)) {
//     return false;
//   }

//   return a.data.current.sortable.index < b.data.current.sortable.index;
// }

// export const customKeyboardCoordinateGetter: KeyboardCoordinateGetter = (
//   event,
//   _ref
// ) => {
//   let {
//     context: {
//       active,
//       collisionRect,
//       droppableRects,
//       droppableContainers,
//       over,
//       scrollableAncestors,
//     },
//   } = _ref;

//   if (directions.includes(event.code)) {
//     event.preventDefault();

//     if (!active || !collisionRect) {
//       return;
//     }

//     const filteredContainers: any[] = [];
//     droppableContainers.getEnabled().forEach((entry) => {
//       if (
//         !entry ||
//         (entry != null && entry.disabled) ||
//         entry.id === active?.id
//       ) {
//         return;
//       }

//       const rect = droppableRects.get(entry.id);

//       if (!rect) {
//         return;
//       }

//       switch (event.code) {
//         case KeyboardCode.Up:
//           if (collisionRect!.top >= rect.bottom) {
//             filteredContainers.push(entry);
//           }

//           break;

//         case KeyboardCode.Down:
//           if (collisionRect!.bottom <= rect.top) {
//             filteredContainers.push(entry);
//           }

//           break;

//         case KeyboardCode.Left:
//           if (collisionRect!.left >= rect.right) {
//             filteredContainers.push(entry);
//           }

//           break;

//         case KeyboardCode.Right:
//           if (collisionRect!.right <= rect.left) {
//             filteredContainers.push(entry);
//           }

//           break;
//       }
//     });

//     // console.warn("CoordinateGetter", {
//     //   active,
//     //   collisionRect: collisionRect,
//     //   droppableRects,
//     //   droppableContainers: filteredContainers,
//     //   pointerCoordinates: null
//     // })

//     const collisions = closestCorners({
//       active,
//       collisionRect: collisionRect,
//       droppableRects,
//       droppableContainers: filteredContainers,
//       pointerCoordinates: null,
//     });
//     let closestId = getFirstCollision(collisions, "id");

//     if (
//       closestId === (over == null ? void 0 : over.id) &&
//       collisions.length > 1
//     ) {
//       closestId = collisions[1].id;
//     }

//     if (closestId != null) {
//       const activeDroppable = droppableContainers.get(active.id);
//       const newDroppable = droppableContainers.get(closestId);
//       const newRect = newDroppable ? droppableRects.get(newDroppable.id) : null;
//       const newNode = newDroppable == null ? void 0 : newDroppable.node.current;

//       if (newNode && newRect && activeDroppable && newDroppable) {
//         const newScrollAncestors = getScrollableAncestors(newNode);
//         const hasDifferentScrollAncestors = newScrollAncestors.some(
//           (element, index) => scrollableAncestors[index] !== element
//         );
//         const hasSameContainer = isSameContainer(activeDroppable, newDroppable);
//         const isAfterActive = isAfter(activeDroppable, newDroppable);
//         const offset =
//           hasDifferentScrollAncestors || !hasSameContainer
//             ? {
//                 x: 0,
//                 y: 0,
//               }
//             : {
//                 x: isAfterActive ? collisionRect.width - newRect.width : 0,
//                 y: isAfterActive ? collisionRect.height - newRect.height : 0,
//               };
//         const rectCoordinates = {
//           x: newRect.left,
//           y: newRect.top,
//         };
//         const newCoordinates =
//           offset.x || offset.y
//             ? rectCoordinates
//             : subtract(rectCoordinates, offset);

//         return newCoordinates;
//       }
//     }
//   }

//   return undefined;
// };
