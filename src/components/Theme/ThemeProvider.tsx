import React, { useState } from "react";
import "./theme.css"

export const ThemeProvider: React.FC<{}> = ({ children }) => {
  const [dark, setDark] = useState(false);
  return <div className={dark ? "theme dark" : "theme light"}>
    <div onClick={() => setDark(!dark)} className="bg-pink w-20 h-20 z-50 draggable rounded absolute left-1/2 top-1/2">{dark ? "dark" : "light"}</div>
    {children}
  </div>
}