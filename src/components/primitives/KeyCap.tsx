import React from "react";

export const KeyCap: React.FC<{ children?: React.ReactNode }> = ({ children }) => {

  return (
    <div className="border border-ramp-200 rounded text-xs text-ramp-900 px-1 py-0.5 inline-block">
      {children}
    </div>
  );
};