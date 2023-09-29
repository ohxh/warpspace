// import { ChevronRightIcon, ClipboardIcon, LinkIcon, PencilIcon, XMarkIcon, } from "@heroicons/react/24/solid";
// import { MenuState } from "ariakit";
// import React from "react";
// import { OpenVisit } from "../../../services/database/DatabaseSchema";
// import { ContentCopyIcon } from "../../primitives/icons/content_copy";
// import { DeleteIcon } from "../../primitives/icons/delete";
// import { ComboSubMenu, ContextMenu, Menu, MenuItem, MenuSeparator } from "../../primitives/Menu";
// import { Favicon } from "./OverviewTab";

// export const OverviewTabContextMenu: React.FC<{
//   selection: OpenVisit[]
//   state: MenuState
//   innerRef?: any
//   handleClose: () => void;

// }> = ({ selection, state, innerRef, handleClose }) => {
//   return <Menu
//     ref={innerRef}
//     state={state}>
//     <>
//       {selection.length === 1 && <div className="pl-3 pr-3 pt-1 text-ramp-900">
//         <div>
//           <Favicon tab={selection[0]} className="w-[1.125rem] h-[1.125rem] rounded-sm align-sub inline-block mr-1" /> <span>{selection[0].metadata.title}</span>
//         </div>
//         <div className="text-xs text-ramp-500 w-full max-lines-3 pb-1 pt-1 break-all overflow-ellipsis overflow-hidden">
//           {selection[0].url}
//         </div>
//       </div>}
//       {selection.length > 1 &&
//         <div className="pl-3 pr-3 pt-1 text-ramp-900">
//           <div>
//             {selection.length} tabs
//           </div>
//           <div className="flex gap-2 flex-wrap relative z-0 overflow-hidden pt-2 pb-1">
//             {selection.map(s => <Favicon tab={s} key={s.id} />)}
//           </div>
//         </div>}
//       <MenuSeparator />
//       <MenuItem label="Close" icon={<XMarkIcon className="w-4 h-4 " />} onClick={handleClose} />
//       <MenuItem label="Rename" icon={<PencilIcon className="w-4 h-4" />} onClick={handleClose} />
//       <MenuItem label="Copy URL" icon={<ContentCopyIcon className="w-4 h-4 " />} />
//       <ComboSubMenu label="Move to..." />
//     </>
//   </Menu>
// }