import React, { forwardRef, useState } from "react";
import {
  DropdownMenu,
  MenuItem,
  MenuSeparator
} from "../../components/primitives/Menu";
import { SettingsIcon } from "../../components/primitives/icons/settings";
import { WarpspaceIcon } from "../../components/primitives/icons/warpspace";
import { SettingsModal } from "../../components/settings/SettingsModal";

export const BrandMenu: React.FC<{}> = ({ }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <DropdownMenu
        trigger={
          <div className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded outline-none">
            <WarpspaceIcon className="text-ramp-900" />
          </div>
        }
      >
        <div className="px-4 py-1">
          <div className="text-sm font-medium text-ramp-900">Oliver</div>
          <div className="text-sm text-ramp-500">oliverhopcroft@gmail.com</div>
          <div className="bg-ramp-100 text-ramp-900 mt-1 uppercase text-xs font-medium tracking-wider rounded px-1 inline-flex items-center py-1">
            <WarpspaceIcon className="w-3 h-3  mr-1 mb-px" />
            <span className="mr-1 ">Premium</span>
          </div>
        </div>

        {/* Upsell to premium here if not owner */}

        <MenuSeparator />
        {/* 
        <SubMenu label="Site options" icon={<DocumentArrowDownIcon />}>
          <div className="text-sm text-ramp-500 px-3 pb-2">www.reddit.com</div>
          <MenuItem label="Disable pinch to open" />
          <MenuItem label="Disable image + text scraping" />
        </SubMenu>

        <MenuItem label="Site option" icon={<TableIcon />} /> */}
        {/* <FeedbackMenuItem /> */}
        {/* <MenuItem
          label="Storage use"
          description={"12.2mb"}
          icon={<DatabaseIcon />}
        />

        <MenuSeparator /> */}
        <MenuItem
          label="Settings..."
          icon={<SettingsIcon className="text-ramp-900" />}
          onClick={() => {
            setOpen(true);
          }}
        />
        {/* 
        <MenuSeparator /> */}

        {/* <MenuDescription>
          <div className="mb-2">405/1000 blocks used</div>
          <div className="border border-ramp-400 rounded-full w-full h-1.5 relative">
            <div
              className="bg-ramp-500 rounded-full absolute inset-0 origin-left"
              style={{ transform: "scaleX(.6)" }}
            />
          </div>
        </MenuDescription> */}
      </DropdownMenu>
      <SettingsModal open={open} setOpen={setOpen} />
    </>
  );
};


// export const FeedbackMenuItem = forwardRef<HTMLDivElement, {}>(
//   (ref) => {

//     const [text, setText] = useState("")

//     const menu = useMenuState({});

//     // Resets combobox value when menu is closed
//     if (!menu.mounted && text) {
//       setText("")
//     }

//     // const Feedback = (props: MenuButtonProps) =>
//     //   <BaseMenuButton
//     //     {...props}
//     //     state={menu}
//     //     className="py-1.5 pl-12 pr-3
//     // flex flex-row items-center relative select-none
//     // leading-4 text-ramp-900
//     // outline-none
//     // data-active-item:bg-ramp-100
//     // "
//     //   >
//     //     Send feedback
//     //     <MenuButtonArrow className="absolute right-3" >
//     //       <ChevronRightIcon />
//     //     </MenuButtonArrow>
//     //   </BaseMenuButton>;

//     return (
//       <>

//       </>
//     );
//   }
// );