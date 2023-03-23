import { LogLevel } from "../logging/log";

export interface WarpspaceSettings {
  appearance: {
    theme: "auto" | "light" | "dark";
    animations: "none" | "minimal" | "smooth";
    width: "normal" | "wide";
    position: "center" | "top";
  };

  privacy: {
    exclusions: string[];

    // remove already-excluded pages
    // clear all

    // clear last hour..
  };

  developer: {
    showDebugUI: boolean;
    logLevel: LogLevel | "none";
    showHiddenResults: boolean;
    showSearchRankingReasons: boolean;
  };

  search: {
    helpBarDismissed: boolean;

    // Exclusions from the results
    excludeSearchResults: boolean;
    excludeFiles: boolean;
    exclusions: string[];
  };
}

export const defaultSettings: WarpspaceSettings = {
  appearance: {
    theme: "light",
    animations: "smooth",
    width: "normal",
    position: "center",
  },
  privacy: {
    // for these exclusions, we don't capture images or text
    exclusions: [],
  },
  developer: {
    showDebugUI: false,
    showHiddenResults: false,
    showSearchRankingReasons: false,
    logLevel: "none",
  },
  search: {
    helpBarDismissed: false,

    excludeSearchResults: true,
    excludeFiles: false,
    exclusions: [],
  },
};
