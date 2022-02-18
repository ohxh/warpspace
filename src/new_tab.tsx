import React from "react";
import ReactDOM from "react-dom";
import { SearchBox } from "./components/new/Search/SearchBox";
import { ThemeProvider } from "./components/Theme/ThemeProvider";
import "./components/new/Settings/theme.css";
import "./style.css";
import { AppSettingsProvider } from "./components/new/Settings/AppSettingsContext";


const Popup = () => {
  chrome.topSites.get(console.warn)
  return <div>
    <h1 className="text-5xl mx-auto text-center">Warpspace</h1>
    <div className="fixed inset-0">
      <SearchBox />
    </div>
    <div className="max-w-2xl mx-auto pt-[50vh] flex flex-wrap gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(t => <div className="w-14 h-14 bg-gray-200 rounded-full"></div>)}
    </div>
  </div>
};

ReactDOM.render(
  <React.StrictMode>
    <AppSettingsProvider>
      <Popup />
    </AppSettingsProvider>
  </React.StrictMode>,
  document.getElementById("root")
);



chrome.runtime.sendMessage({ event: "new-tab-open" })