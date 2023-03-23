import { RadioGroup } from "@headlessui/react";
import React from "react";

export const ThemeRadio: React.FC<{
  value: "light" | "dark";
  onChange: (x: "light" | "dark") => void;
}> = ({ value, onChange }) => {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className="flex flex-col py-2 select-none"
    >
      <RadioGroup.Label>Theme</RadioGroup.Label>
      <RadioGroup.Description className="text-sm text-ramp-500">
        Global app theme.
      </RadioGroup.Description>
      <div className="flex flex-row py-2 pt-4 gap-x-2">
        <RadioGroup.Option value="dark">
          {({ checked }) => (
            <div
              className={`${checked ? "ring-3 ring-offset-2 ring-focus" : ""
                } rounded-lg w-16 `}
            >
              <div
                className={`theme theme-dark bg-ramp-0 relative flex flex-col  text-center rounded-lg focus-visible:bg-ramp-200 hover:bg-ramp-200 outline-none pb-2 pt-1 px-3`}
              >
                <div className="text-3xl pb-2 text-ramp-900 tracking-tighter">
                  Ag
                </div>
                <div className="text-xs text-ramp-500">Dark</div>
              </div>
            </div>
          )}
        </RadioGroup.Option>
        <RadioGroup.Option value="light">
          {({ checked }) => (
            <div
              className={`border border-ramp-400 theme theme-light  w-16 bg-ramp-0 relative flex flex-col  text-center rounded-lg focus-visible:bg-ramp-200 hover:bg-ramp-200 outline-none pb-2 pt-1 px-3 ${checked ? "ring-3 ring-offset-2 ring-focus" : ""
                }`}
            >
              <div className="text-3xl text-ramp-900 pb-2 tracking-tighter ">
                Ag
              </div>
              <div className="text-xs text-ramp-500">Light</div>
            </div>
          )}
        </RadioGroup.Option>
        {/* <RadioGroup.Option value="system">
          {({ checked }) => (
            <div
              className={`relative group rounded-lg  w-16s ${checked ? "ring-3 ring-offset-2 ring-focus" : ""
                }`}
            >
              <div className="border border-ramp-400 absolute left-0 top-0 theme theme-dark bg-ramp-0 flex flex-col text-center rounded-lg group-focus-visible:bg-ramp-200 group-hover:bg-ramp-200 outline-none pb-2 pt-1 px-3 ">
                <div className="text-3xl text-ramp-900 pb-2 tracking-tighter">
                  Ag
                </div>
                <div className="text-xs text-ramp-500">System</div>
              </div>
              <div
                style={{
                  clipPath: "polygon(-10% -10%, -1% 100%, 100% -1%)",
                }}
                className="absolute left-0 top-0 theme theme-light border border-ramp-400  bg-ramp-0 flex flex-col  text-center rounded-lg group-focus-visible:bg-ramp-200 group-hover:bg-ramp-200 outline-none pb-2 pt-1 px-3"
              >
                <div className="text-3xl text-ramp-900 pb-2 tracking-tighter">
                  Ag
                </div>
                <div className="text-xs text-ramp-500">System</div>
              </div>
            </div>
          )}
        </RadioGroup.Option> */}
      </div>
    </RadioGroup>
  );
};
