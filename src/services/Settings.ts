import { WarpspaceEvent } from "../utils/WarpspaceEvent";
import * as logging from "../services/Logging";
import { produce } from "immer";

export enum LogLevel {
  TRACE,
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

export interface Settings {
  display: {
    density: "compact" | "normal" | "comfortable";
    theme: "light" | "dark" | "black";
    tabsPerRow: number;
  };

  crawl: {
    exclude: any;
  };

  shortcuts: {};

  gestures: {
    pinchToOpen: boolean;
  };

  developer: {
    logLevel: LogLevel;
  };
}

chrome.storage.onChanged.addListener((changes) => {});

//We could use the fancy chrome.storage api but that is async
//What we really need is blocking so we can get settings out before any logs are made, etc.

const defaultSettings: Settings = {
  display: {
    density: "normal",
    theme: "light",
    tabsPerRow: 6,
  },
  shortcuts: {},
  crawl: {
    exclude: [],
  },
  gestures: {
    pinchToOpen: true,
  },
  developer: {
    logLevel: LogLevel.TRACE,
  },
};

export var settings: Settings;

export var onChange: WarpspaceEvent<[Settings]> = new WarpspaceEvent();

export const data = () => {
  // return settings;
};

export const update = async (modify: (draft: Settings) => void) => {
  // settings = produce(settings, modify);
  // //@ts-ignore
  // onChange.fire(settings);
  // await chrome.storage.local.set({ WarpspaceSettings: settings });
};
