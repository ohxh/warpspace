import React from "react";

export const AccountTab: React.FC<{}> = ({ }) => {
  return (
    <div>
      <div className="py-2 flex flex-row gap-x-3 ">
        <div className="w-12 h-12 rounded-full bg-orange" />
        <div>
          <div>Oliver Hopcroft</div>
          <div className="text-sm text-ramp-500 mt-1">
            olvierhopcroft@gmail.cmo
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-x-2 py-2">
        <div className="h-28 rounded border border-ramp-300 flex-1 hover:bg-ramp-200 p-2 relative">
          <div className="text-sm text-ramp-700 absolute top-2 left-2">
            Tabs
          </div>
          <div className="text-2xl absolute right-2 bottom-2">46,403</div>
        </div>
        <div className="h-28 rounded border border-ramp-300 flex-1 hover:bg-ramp-200 p-2 relative">
          <div className="text-sm text-ramp-700 absolute top-2 left-2">
            Notes
          </div>
          <div className="text-2xl absolute right-2 bottom-2">523</div>
        </div>
        <div className="h-28 rounded border border-ramp-300 flex-1 hover:bg-ramp-200 p-2 relative">
          <div className="text-sm text-ramp-700 absolute top-2 left-2">
            Spaces
          </div>
          <div className="text-2xl absolute right-2 bottom-2">24</div>
        </div>
      </div>
    </div>
  );
}