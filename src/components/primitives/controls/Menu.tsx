import { ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  Menu as BaseMenu,
  MenuArrow,
  MenuButton as BaseMenuButton, MenuButton, MenuButtonArrow, MenuDescription as BaseMenuDescription, MenuGroup as BaseMenuGroup, MenuGroupLabel as BaseMenuGroupLabel, MenuItem as BaseMenuItem, MenuItemCheck, MenuItemCheckbox as BaseMenuItemCheckbox, MenuSeparator as BaseMenuSeparator, MenuState, useMenuState
} from "ariakit";
import React, {
  forwardRef,
  HTMLAttributes,
  RefAttributes,
  useEffect,
  useRef,
  useState
} from "react";
import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  useComboboxState,
} from "ariakit/combobox";

export const Menu = React.forwardRef<HTMLDivElement, { state: MenuState, wide?: boolean, children?: React.ReactNode }>(({ state, wide, children }, ref) => {

  return (
    <div onKeyDown={(e) => e.stopPropagation}
      onClick={(e) => e.stopPropagation}
      onMouseDown={(e) => e.stopPropagation}
      onDragStart={(e) => e.stopPropagation}
      onDragEnd={(e) => e.stopPropagation}
      onDrag={(e) => e.stopPropagation}
    >
      <BaseMenu
        ref={ref}
        state={state}
        className={`
    ${wide ? "w-96" : "w-60"} bg-ramp-0 rounded-md
    dark:border dark:border-ramp-200 dark:bg-ramp-100
   shadow-xl ring-1 ring-black/5 outline-none
   z-40
   pt-2 pb-2
   duration-100
   transition-all
   data-enter:ease-out data-leave:ease-in
    data-enter:opacity-100 data-leave:opacity-0
    data-enter:scale-100 data-leave:scale-95
   `}
      >
        {children}
      </BaseMenu>
    </div>
  );
});

export type MenuItemProps = HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  icon?: React.ReactNode;
  description?: React.ReactNode
  shortcut?: React.ReactNode;
  disabled?: boolean;
};

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  ({ label, icon, shortcut, disabled, description, ...props }, ref) => {
    return (
      <BaseMenuItem
        className={`
        text-sm
        w-full pl-12 pr-3 py-1.5 relative select-none
        ${disabled ? "text-ramp-500 pointer-events-none" : "text-ramp-900"}
        active:bg-ramp-100 active:dark:bg-ramp-200 data-active:bg-ramp-100 data-active:dark:bg-ramp-200 data-active-item:bg-ramp-100 data-active-item:dark:bg-ramp-200
        outline-none
        leading-4 
      `}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        <div className="flex flex-row items-center">
          {icon && (
            <div className="absolute left-3 text-ramp-900"> {icon}</div>
          )}
          {label}
          {shortcut && (
            <div className="absolute right-3 text-sm text-ramp-500">
              {shortcut}
            </div>
          )}
        </div>
        {description && <div className="text-sm text-ramp-500 pb-1">{description}</div>}
      </BaseMenuItem>
    );
  }
);

export type MenuItemCheckboxProps = HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  name: string
  shortcut?: React.ReactNode;
  disabled?: boolean;
};

export const MenuItemCheckbox = forwardRef<HTMLDivElement, MenuItemCheckboxProps>(
  ({ label, name, shortcut, disabled, ...props }, ref) => {
    return (
      <BaseMenuItemCheckbox
        name={name}
        className={`
        text-sm
        w-full flex flex-row items-center py-1.5 pl-12 pr-3 relative select-none
        ${disabled ? "text-ramp-500 pointer-events-none" : "text-ramp-900"}
        active:bg-ramp-100 active:dark:bg-ramp-200 data-active:bg-ramp-100 data-active:dark:bg-ramp-100 data-active-item:bg-ramp-100 data-active-item:dark:bg-ramp-200
        outline-none
        leading-4 
      `}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        <div className="absolute left-3 w-4 h-4 text-ramp-900"><MenuItemCheck /></div>

        {label}{" "}
        {shortcut && (
          <div className="absolute right-3 text-sm text-ramp-500">
            {shortcut}
          </div>
        )}
      </BaseMenuItemCheckbox>
    );
  }
);

type Values = {
  [x: string]: string | number | boolean | (string | number)[];
}

export function DropdownMenu<V extends Values = Values>({ trigger, values, onChange, children }: { trigger: React.ReactNode, values?: V, onChange?: (x: V) => void, children: React.ReactNode }) {
  const menu = useMenuState<V>({
    animated: true,
    gutter: 8,
    shift: 0,
    setValues: onChange,
    values: values,
  });

  return (
    <>
      <BaseMenuButton state={menu as any}>
        {trigger}
      </BaseMenuButton>
      <Menu state={menu as any}>{children}</Menu>
    </>
  );
};


export function ContextMenu<V extends Values = Values>({ menuItems, values, onChange, children }: { menuItems: React.ReactNode, values?: V, onChange?: (x: V) => void, children: React.ReactNode }) {
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const wrapper = useRef<HTMLDivElement>(null)
  const menu = useMenuState({
    getAnchorRect: () => anchorRect, animated: true,
    gutter: 8,
    shift: 0,
    setValues: onChange,
    values: values,
  });
  return (
    <div
      className="wrapper"
      ref={wrapper}
      onContextMenu={(event) => {
        event.stopPropagation()
        event.preventDefault();
        setAnchorRect({ x: event.clientX, y: event.clientY });
        menu.show();
      }}
      onKeyDownCapture={(e) => {
        if (e.key === "c") {
          e.stopPropagation()
          setAnchorRect({ x: wrapper.current!.getBoundingClientRect().left, y: wrapper.current!.getBoundingClientRect().top });
          menu.show();
        }
      }}
    >
      {children}
      <Menu
        state={menu as any}>
        {menuItems}
      </Menu>
    </div>
  )
};

export type SubMenuProps = HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode
};

type MenuButtonProps = HTMLAttributes<HTMLDivElement> &
  RefAttributes<HTMLDivElement>;

export const SubMenu = forwardRef<HTMLDivElement, SubMenuProps>(
  ({ label, icon, children, ...props }, ref) => {
    const menu = useMenuState({
      animated: true,
      gutter: 0,
      shift: -8,
    });

    return (
      <>
        <BaseMenuItem
          ref={ref}
          {...props}
          className={`
        data-disabled:text-ramp-500 data-disabled:pointer-events-none
        active:bg-ramp-100 active:dark:bg-ramp-200 data-active:bg-ramp-100 data-active:dark:bg-ramp-200 data-active-item:bg-ramp-100 data-active-item:dark:bg-ramp-200
        outline-none  text-sm
      `}
        >
          {(props: MenuButtonProps) =>
            <BaseMenuButton
              state={menu}
              {...props}
              className="py-1.5 pl-12 pr-3
            w-full flex flex-row items-center relative select-none
            leading-4 text-ramp-900
            outline-none
            data-active-item:bg-ramp-100
            data-active-item:dark:bg-ramp-200
            "
            >
              {icon && (
                <div className="absolute left-3 text-ramp-900"> {icon}</div>
              )}
              {label}
              <MenuButtonArrow className="absolute right-3" >
                <ChevronRightIcon />
              </MenuButtonArrow>
            </BaseMenuButton>}
        </BaseMenuItem>
        <Menu state={menu}>{children}</Menu>
      </>
    );
  }
);

export const MenuSeparator: React.FC<{}> = ({ }) => {
  return <BaseMenuSeparator className="border-ramp-200 my-2" />;
};

export const MenuLabel: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <BaseMenuGroupLabel className="uppercase tracking-wider text-gray-500 text-xs">{children}</BaseMenuGroupLabel>;
};

export const MenuGroup: React.FC<{}> = ({ }) => {
  return <BaseMenuGroup />
}

export const MenuDescription: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <BaseMenuDescription as="div" className="px-3 py-2 text-xs text-ramp-500">{children}</BaseMenuDescription>
}


const defaultList = [
  "Paragraph",
  "Heading",
  "List",
  "Quote",
  "Classic",
  "Code",
  "Preformatted",
  "Pullquote",
  "Table",
  "Verse",
  "Image",
  "Gallery",
  "Audio",
  "Cover",
  "File",
  "Media & Text",
  "Video",
  "Buttons",
  "Columns",
  "Group",
  "More",
  "Page Break",
  "Separator",
  "Archives",
  "Calendar",
  "Categories",
  "Latest Comments",
  "Latest Posts",
  "Page List",
  "RSS",
  "Search",
  "Shortcode",
  "Social Icons",
  "Tag Cloud",
];


export const ComboSubMenu = forwardRef<HTMLDivElement, SubMenuProps>(
  ({ label, icon, children, ...props }, ref) => {

    const combobox = useComboboxState({
      defaultList,
      animated: true,
      placement: "right-start",
      gutter: 0,
      shift: -8,

    });

    const menu = useMenuState(combobox);

    // Resets combobox value when menu is closed
    if (!menu.mounted && combobox.value) {
      combobox.setValue("");
    }

    return (
      <>
        <BaseMenuItem
          ref={ref}
          {...props}
          className={`
        data-disabled:text-ramp-500 data-disabled:pointer-events-none
        active:bg-ramp-100 data-active:bg-ramp-100 data-active-item:bg-ramp-100
        outline-none
      `}
        >
          {(props: MenuButtonProps) =>
            <BaseMenuButton
              state={menu}
              {...props}
              className="py-1.5 pl-12 pr-3
            w-full flex flex-row items-center relative select-none
            leading-4 text-ramp-900
            outline-none
            data-active-item:bg-ramp-100
            "
            >
              {icon && (
                <div className="absolute left-3 text-ramp-900"> {icon}</div>
              )}
              {label}
              <MenuButtonArrow className="absolute right-3" >
                <ChevronRightIcon />
              </MenuButtonArrow>
            </BaseMenuButton>}
        </BaseMenuItem>
        <Menu state={menu} wide>
          <div className="w-full px-1 py-1.5 border-b border-ramp-200 mb-1.5">
            <Combobox
              state={combobox}
              autoSelect
              placeholder="Search..."
              className="w-full rounded ring-none outline-none px-2 text-base leading-4"
            />
          </div>

          <ComboboxList state={combobox} className="combobox-list max-h-96 overflow-scroll">
            {combobox.matches.map((value, i) => (
              <div
                key={value}
                onClick={() => { menu.hideAll() }}
                onKeyDown={(e) => { if (e.key === "Enter") { menu.hideAll() } }}
              >
                <ComboboxItem
                  key={value + i}
                  value={value}
                  focusOnHover
                  setValueOnClick={false}
                  className="
                w-full pl-3 pr-3 py-1.5 relative select-none
                active:bg-ramp-100 data-active:bg-ramp-100 data-active-item:bg-ramp-100
                outline-none
                leading-4 "
                />
              </div>
            ))}
          </ComboboxList>

        </Menu>
      </>
    );
  }
);
