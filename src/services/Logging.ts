import * as Settings from "./Settings";

export function trace(...args: any) {
  log(Settings.LogLevel.TRACE, ...args);
}
export function debug(...args: any) {
  log(Settings.LogLevel.DEBUG, ...args);
}
export function info(...args: any) {
  log(Settings.LogLevel.INFO, ...args);
}
export function warn(...args: any) {
  log(Settings.LogLevel.WARN, ...args);
}
export function error(...args: any) {
  log(Settings.LogLevel.ERROR, ...args);
}

export function log(level: Settings.LogLevel, ...args: any) {
  //Only output logs at the apppropriate level or higher
  if (level >= Settings.data().developer.logLevel) {
    const now = new Date();
    const timestamp = `[${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}]`;
    const prefix = `${timestamp} ${Settings.LogLevel[level]}:`;
    switch (level) {
      case Settings.LogLevel.TRACE:
        console.trace(prefix, ...args);
        break;
      case Settings.LogLevel.DEBUG:
        console.debug(prefix, ...args);
        break;
      case Settings.LogLevel.INFO:
        console.info(prefix, ...args);
        break;
      case Settings.LogLevel.WARN:
        console.warn(prefix, ...args);
        break;
      case Settings.LogLevel.ERROR:
        console.error(prefix, ...args);
        break;
    }
  }
}

if (Settings.data().developer.logLevel <= Settings.LogLevel.ERROR) {
  console.log(
    `%c  __      ___   ___ ___  ___ ___  _   ___ ___ 
  \\ \\    / /_\\ | _ \\ _ \\/ __| _ \\/_\\ / __| __|
   \\ \\/\\/ / _ \\|   /  _/\\__ \\  _/ _ \\ (__| _| 
    \\_/\\_/_/ \\_\\_|_\\_|  |___/_|/_/ \\_\\___|___|
                                              `,
    "font-family:monospace"
  );
  console.log(`
  Warpspace log level: ${
    Settings.LogLevel[Settings.data().developer.logLevel]
  }. Adjust in settings:
  ${chrome.runtime.getURL("settings.html")} 
   `);
}
