// import { CogIcon, XMarkIcon } from "@heroicons/react/24/outline";
// import { Cog6ToothIcon } from "@heroicons/react/24/solid";

// import React, {
//   DetailedHTMLProps, HTMLAttributes, useState
// } from "react";
// import { OpenVisit } from "../../../services/database/DatabaseSchema";
// import { ExtensionIcon } from "../../primitives/icons/extension";
// import { WarpspaceIcon } from "../../primitives/icons/warpspace";
// import { WorldIcon } from "../Window/WorldIcon";
// import "./overview-tab.css";
// import { TabPreview } from "./TabPreview";

// export interface OverviewTabProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
//   tab: OpenVisit;
//   containingSelection?: number[]
//   dragging: boolean;
//   menuOpen?: boolean;
//   current: boolean;
//   handleDelete?: (x: OpenVisit) => void;
//   closing?: boolean;
// }

// const OverviewTabInner: React.FC<OverviewTabProps> = (
//   ({ current, tab, containingSelection, dragging, handleDelete, menuOpen, closing }) => {

//     // console.log("overview tab inner renders ", tab.id, tab.updatedAt.getMilliseconds())

//     const selected = !!containingSelection;

//     return (<div className={closing ? "scale-95 opacity-0 transition-all duration-75" : ""}>
//       <div className={`selection ${selected ? "bg-highlight" : ""} `} />
//       <TabPreview current={current} tab={tab} zoomingOut={false} selected={selected} dragging={dragging} menuOpen={menuOpen} />
//       <div className={`relative mt-2 ${dragging && "animate-fadeOut opacity-0"}`}>
//         <div className="flex flex-row gap-x-2 items-center px-[0.125rem] ">
//           <Favicon tab={tab} />
//           <span className="flex-1 text-ellipsis whitespace-nowrap overflow-hidden text-[0.875rem] text-ramp-900">
//             {!tab.url && (tab.isNewTabPage ? "New Tab" : "Chrome")}
//             {tab.metadata.title}
//           </span>
//         </div>
//         {handleDelete &&
//           <div className={`opacity-0 hover:opacity-100 transition-opacity 
//             absolute right-0 top-0 bottom-0 
//             flex flex-row items-center
//             pl-6 bg-gradient-to-r from-transparent
//             ${selected ? "via-highlight to-highlight" : "via-ramp-0 to-ramp-0"}`}>
//             <button
//               tabIndex={-1}
//               className="rounded-full p-1 tab-x-button active:bg-ramp-100"
//               onClickCapture={async (e) => {
//                 e.stopPropagation()
//                 handleDelete?.(tab)
//               }}
//             >
//               <XMarkIcon className="w-3.5 h-3.5 text-ramp-800"></XMarkIcon>
//             </button>
//           </div>}
//       </div>
//     </div>
//     );
//   }
// );

// var x = (a: any, b: any) => {

//   function areEqualShallow(a: any, b: any) {
//     const res: string[] = []

//     for (var key in a) {
//       if (!(key in b) || a[key] !== b[key]) {
//         if (!res.includes(key)) {
//           // console.log("Diff in key", key)
//           res.push(key)
//         }
//       }
//     }
//     for (var key in b) {
//       if (!(key in a) || a[key] !== b[key]) {
//         if (!(res.includes(key)))
//           res.push(key)
//       }
//     }
//     return res;
//   }



//   let x = areEqualShallow(a, b);

//   if (x.length === 1 && x.includes("tab")) {
//     // console.log("QQ Only diff in tab, updated at changed? ", (a.tab.id, a.tab.updatedAt as Date)?.getTime?.() !== b.tab.updatedAt?.getTime?.())
//     return (a.tab.id, a.tab.updatedAt as Date)?.getTime?.() === b.tab.updatedAt?.getTime?.();
//   }
//   if (x.length > 0) {
//     // console.log("QQ Diff in keys: ", x)
//     return false;
//   }

//   // consolke.log("QQ No need")
//   return true
// }

// export const OverviewTab = React.memo(OverviewTabInner, x)

// export interface FaviconProps extends DetailedHTMLProps<HTMLAttributes<Element>, Element> { tab: OpenVisit }

// export const Favicon: React.FC<FaviconProps> = ({ tab, ref, ...props }) => {
//   // if (tab.state.status === "loading") return <svg className={props.className || " w-[1.125rem] h-[1.125rem] rounded-sm text-focus"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">

//   //   <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//   // </svg>

//   return <>
//     {tab.metadata.favIconUrl && (
//       <img
//         src={tab.metadata.favIconUrl}
//         {...props}
//         className={props.className || "mt-0.5 w-[1.125rem] h-[1.125rem] rounded-sm"}
//       ></img>
//     )}
//     {!tab.metadata.favIconUrl &&
//       !tab.url &&
//       !tab.isNewTabPage && (
//         <Cog6ToothIcon
//           {...props}
//           className={props.className || "mt-0.5  w-[1.125rem] h-[1.125rem] rounded-sm text-focus"}
//         />
//       )}
//     {!tab.metadata.favIconUrl &&
//       !tab.url &&
//       tab.isNewTabPage && (
//         <WarpspaceIcon
//           {...props}
//           className={props.className || "mt-0.5  w-[1.125rem] h-[1.125rem] rounded-sm text-gray-800"}
//         />
//       )}
//     {!tab.metadata.favIconUrl && tab.url && (
//       <WorldIcon {...props}
//         className={props.className || "mt-0.5  w-[1.125rem] h-[1.125rem] rounded-sm text-gray-800"} />
//     )}
//   </>;
// };
