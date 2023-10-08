import * as Ariakit from "@ariakit/react";
import React, {
  forwardRef,
  HTMLAttributes
} from "react";


export const Select = React.forwardRef<HTMLDivElement, { value: (string | string[]), onChange: ((x: (string | string[])) => void), wide?: boolean, children?: React.ReactNode }>(({ value, onChange, children, wide }, ref) => {

  return (
    <div onKeyDown={(e) => e.stopPropagation}
      onClick={(e) => e.stopPropagation}
      onMouseDown={(e) => e.stopPropagation}
      onDragStart={(e) => e.stopPropagation}
      onDragEnd={(e) => e.stopPropagation}
      onDrag={(e) => e.stopPropagation}
      className="flex flex-col"
    >
      <Ariakit.SelectProvider
        value={value}
        setValue={onChange}
        animated
      >
        <Ariakit.Select
          as="div"
          ref={ref}
          className="px-2 py-1 rounded border border-ramp-200 text-ramp-700 flex flex-row place-content-between items-center"
        />
        <div className="absolute z-40">
          <Ariakit.SelectPopover gutter={4} sameWidth className={`
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
   `}>
            {children}
          </Ariakit.SelectPopover>
        </div>
      </Ariakit.SelectProvider>
    </div>
  );
});

export type SelectItemProps = HTMLAttributes<HTMLDivElement> & {
  value: string,
  label: React.ReactNode;
  description?: React.ReactNode
  disabled?: boolean;
};

export const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  ({ label, disabled, description, value, ...props }, ref) => {
    return (
      <Ariakit.SelectItem
        value={value}
        className={`
        text-sm
        w-full pl-3 pr-3 py-1.5 relative select-none
        ${disabled ? "text-ramp-500 pointer-events-none" : "text-ramp-900"}
        active:bg-ramp-100 active:dark:bg-ramp-200 data-active:bg-ramp-100  data-active-item:bg-ramp-100 data-active-item:dark:bg-ramp-200
        outline-none
        leading-4 
      `}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        <div className="flex flex-row items-center">
          {label}
        </div>
        {description && <div className="text-sm text-ramp-500 pb-1">{description}</div>}
      </Ariakit.SelectItem>
    );
  }
);
