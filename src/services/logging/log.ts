import { getLiveSettings } from "../settings/WarpspaceSettingsContext";

export type LogLevel = "error" | "warn" | "info" | "debug";

const settings = getLiveSettings();

export async function debug(...args: any) {
  await settings;
  log("debug", ...args);
}
export async function info(...args: any) {
  await settings;
  log("info", ...args);
}
export async function warn(...args: any) {
  await settings;
  log("warn", ...args);
}
export async function error(...args: any) {
  await settings;
  log("error", ...args);
}

export function log(level: LogLevel, ...args: any[]) {
  const [message, ...rest] = args;

  const label = [
    // `%c Warpspace %c ${message}`,
    // "font-weight: bold; border: 1px solid gray;",
    `%c ${message}`,
    `font-weight: ${rest.length === 0 ? "400" : "600"}; color: ${
      logColors[level]
    }`,
  ];

  if (rest.length === 0) {
    if (typeof message === "object") {
      message instanceof Timer ? message.print() : console.log(message);
    } else console.log(...label);
  } else {
    console.groupCollapsed(...label);
    rest.forEach((x) => (x instanceof Timer ? x.print() : console.log(x)));
    console.groupEnd();
  }
}

const logColors = {
  debug: "green",
  info: "",
  warn: "orange",
  error: "red",
};

// if (Settings.data().developer.logLevel <= Settings.LogLevel.ERROR) {
// console.log(
//   `%c  __      ___   ___ ___  ___ ___  _   ___ ___
//   \\ \\    / /_\\ | _ \\ _ \\/ __| _ \\/_\\ / __| __|
//    \\ \\/\\/ / _ \\|   /  _/\\__ \\  _/ _ \\ (__| _|
//     \\_/\\_/_/ \\_\\_|_\\_|  |___/_|/_/ \\_\\___|___|
//                                               `,
//   "font-family:monospace"
// );
// console.log(`
// Warpspace log level: ${
//   Settings.LogLevel[Settings.data()/]
// }. Adjust in settings:
// ${chrome.runtime.getURL("settings.html")}
//  `);
// }

export class Timer {
  start: number = performance.now();
  end: number | undefined = undefined;
  checkpoints: [number, string][] = [];

  constructor() {}

  mark(name: string) {
    this.checkpoints.push([performance.now(), name]);
  }

  finish() {
    this.end = performance.now();
  }

  print() {
    console.groupCollapsed(
      `%c ⌛ ${((this.end ?? performance.now()) - this.start).toFixed(2)}ms ${
        this.end ? "" : "(ongoing)"
      }`,
      "font-weight:normal;"
    );
    this.checkpoints.forEach(([time, name], i) => {
      const prev = this.checkpoints[i - 1]?.[0] ?? this.start;
      console.log(`${(time - prev).toFixed(2)}ms ${name}`);
    });
    console.groupEnd();
  }
}
