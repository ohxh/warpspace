import React, { useState } from "react";

export const ThemeProvider: React.FC<{}> = ({ children }) => {
  const [darkish, setDark] = useState(2);

  const dark = darkish % 3;

  return <div className={dark == 1 ? "theme dark row-width-6" : dark == 2 ? "theme light row-width-6" : "theme black row-width-6"}>
    {/* <div onClick={() => setDark(dark + 1)} className="bg-pink w-20 h-20 z-50 draggable rounded absolute left-1/2 top-1/2">{dark ? "dark" : "light"}</div> */}
    {children}
  </div>
}