export type LogLevel = "error" | "warn" | "info" | "debug";

const boundary = new Promise((resolve) => {});

export async function debug(...args: any) {
  await boundary;
  log("debug", ...args);
}
export async function info(...args: any) {
  await boundary;
  log("info", ...args);
}
export async function warn(...args: any) {
  await boundary;
  log("warn", ...args);
}
export async function error(...args: any) {
  await boundary;
  log("error", ...args);
}

export function log(level: LogLevel, ...args: any[]) {
  const [message, ...rest] = args;

  const label = [
    // `%c Warpspace %c ${message}`,
    // "font-weight: bold; border: 1px solid gray;",
    `%c ${message}`,
    `font-weight: 400; color: ${logColors[level]}`,
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
  debug: "",
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
      `%c ⌛ ${(this.end ?? performance.now()) - this.start}ms ${
        this.end ? "" : "(ongoing)"
      }`,
      "font-weight:normal;"
    );
    this.checkpoints.forEach(([time, name], i) => {
      const prev = this.checkpoints[i - 1]?.[0] ?? this.start;
      console.log(`${time - prev}ms ${name}`);
    });
    console.groupEnd();
  }
}
