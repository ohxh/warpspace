import React, { useEffect, useState } from "react";
import { useContext } from "react";


const appSettingsContext =
  //@ts-ignore
  React.createContext<[AppSettings, (x: AppSettings) => void]>(null);

export interface AppSettings {
  colorTheme: "light" | "dark" | "black";
  spacing: "tight" | "normal" | "comfortable";
  tabsPerRow: number;
}

export const defaultAppSettings: AppSettings = {
  colorTheme: "light",
  spacing: "normal",
  tabsPerRow: 6,
};

export const AppSettingsProvider: React.FC = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>();

  const updateSettings = (x: AppSettings) => {
    document.body.className = "theme";
    document.body.classList.add(`theme-${x.colorTheme}`);
    document.body.classList.add(`spacing-${x.colorTheme}`);
    document.body.classList.add(`row-width-${x.tabsPerRow}`);
    console.warn("Updates", document.body.className);
    setSettings(x);
  };

  useEffect(() => {
    const listener = (changes: { [key: string]: any }, areaName: string) => {
      if (areaName !== "local" || !changes.hasOwnProperty("warpspaceSettings"))
        return;
      updateSettings({ ...defaultAppSettings, ...changes["warpspaceSettings"].newValue });
    };

    chrome.storage.onChanged.addListener(listener);
    chrome.storage.local.get("warpspaceSettings").then((v) => {
      updateSettings({ ...defaultAppSettings, ...v["warpspaceSettings"] });
    });

    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  // Before loading settings, we can't show anything
  if (!settings) return <div>Loading settings</div>;

  return (
    <appSettingsContext.Provider
      value={[
        settings,
        (e) => chrome.storage.local.set({ "warpspaceSettings": e }),
      ]}
    >
      {children}
    </appSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  return useContext(appSettingsContext);
};
