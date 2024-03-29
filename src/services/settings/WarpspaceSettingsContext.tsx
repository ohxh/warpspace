
import React, { useEffect, useState } from "react";
import { WarpspaceEvent } from "../../utils/WarpspaceEvent";
import { defaultSettings, WarpspaceSettings } from "./settings";

export const appSettingsContext =
  //@ts-ignore
  React.createContext<[WarpspaceSettings, (x: WarpspaceSettings) => void]>(null);


export async function getLiveSettings() {
  const onChange = new WarpspaceEvent<[WarpspaceSettings]>()
  let settings = { ...defaultSettings, onChange };

  const listener = (changes: { [key: string]: any }, areaName: string) => {
    if (areaName !== "local" || !changes.hasOwnProperty("warpspaceSettings"))
      return;
    Object.assign(settings, v["warpspaceSettings"])
    onChange.fire(settings as WarpspaceSettings)
  };

  chrome.storage.onChanged.addListener(listener);
  const v = await chrome.storage.local.get("warpspaceSettings")

  Object.assign(settings, v["warpspaceSettings"])

  return settings
}


export const WarpspaceSettingsProvider: React.FC<{ defaults?: WarpspaceSettings, children?: React.ReactNode }> = ({ children, defaults }) => {
  const [settings, setSettings] = useState<WarpspaceSettings | undefined>(undefined);

  useEffect(() => {
    const listener = (changes: { [key: string]: any }, areaName: string) => {
      if (areaName !== "local" || !changes.hasOwnProperty("warpspaceSettings"))
        return;

      setSettings({ ...defaultSettings, ...changes["warpspaceSettings"].newValue });
    };

    chrome.storage.onChanged.addListener(listener);
    chrome.storage.local.get("warpspaceSettings").then((v) => {
      setSettings({ ...defaultSettings, ...v["warpspaceSettings"] });
    });

    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  // Before loading settings, we can't show anything
  if (!settings) return <div className="fixed inset-0 z-10"></div>;

  return (
    <appSettingsContext.Provider
      value={[
        settings,
        (e) => {
          chrome.storage.local.set({ "warpspaceSettings": e })
        },
      ]}
    >
      {children}
    </appSettingsContext.Provider>
  );
};
