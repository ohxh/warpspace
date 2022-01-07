import { WarpspaceEvent } from "../utils/WarpspaceEvent";
import * as logging from "../services/Logging";

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

var _data: Partial<Settings>;

export var onChange: WarpspaceEvent<[Settings]> = new WarpspaceEvent();

export const data = () => {
  return defaultSettings;
  //return Object.assign(defaultSettings, _data);
};

// export const updateSettings = (val: Partial<Settings>) => {
//   _data = { ..._data, ...val };
//   localStorage.setItem("warpspaceSettings", JSON.stringify(_data));
//   onChange.fire(data());
// };

// export const updateState = () => {
//   try {
//     // _data = JSON.parse(localStorage.getItem("warpspaceSettings") || "");
//   } catch (e) {
//     _data = {};
//     // localStorage.setItem("warpspaceSettings", JSON.stringify(_data));
//   }
//   // onChange.fire(data());
// };

// updateState();
// window.addEventListener("storage", updateState);

// /**
//  * Simple object check.
//  * @param item
//  * @returns {boolean}
//  */
// export function isObject(item: any) {
//   return (item && typeof item === 'object' && !Array.isArray(item));
// }

// /**
//  * Deep merge two objects.
//  * @param target
//  * @param sources
//  */
// export function mergeDeep<T>(target:  T, source: T ): T {

//   if (isObject(target) && isObject(source)) {
//     for (const key in source) {
//       if (isObject(source[key])) {
//         if (!target[key]) Object.assign(target, { [key]: {} });
//         mergeDeep(target[key], source[key]);
//       } else {
//         Object.assign(target, { [key]: source[key] });
//       }
//     }
//   }

//   return mergeDeep(target, ...sources);
// }

// type RecursivePartial<T> = {
//   [P in keyof T]?:
//     T[P] extends (infer U)[] ? RecursivePartial<U>[] :
//     T[P] extends object ? RecursivePartial<T[P]> :
//     T[P];
// };
