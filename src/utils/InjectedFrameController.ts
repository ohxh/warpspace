export class InjectedFrameController {
  name: string;

  open = false;
  frame: HTMLIFrameElement;

  constructor(name: string) {
    this.name = name;
    const frame = document.createElement("iframe");
    frame.src = chrome.runtime.getURL("search.html");
    frame.id = "warpspace-search-injected-app";
    this.frame = frame;

    window.addEventListener("visibilitychange", (e) => {
      if (this.open && document.visibilityState === "hidden") {
        this.close();
      }
    });

    window.addEventListener("message", (m) => {
      if (m.data.event === `enter-${this.name}`) this.enterSearch();
      else if (m.data.event === `exit-${this.name}`) this.close();
    });

    chrome.runtime.onMessage.addListener((m: any) => {
      if (m.event === `enter-${this.name}`) this.enterSearch();
      else if (m.event === `exit-${this.name}`) this.close();
    });
  }

  enterSearch = () => {
    if (!document.body) {
      window.addEventListener("DOMContentLoaded", this.enterSearch, {
        once: true,
      });
    }

    chrome.runtime.sendMessage({ event: `${this.name}-opened` });
    if (this.open) return;

    this.frame.focus();
    document.body.appendChild(this.frame);

    this.open = true;
  };

  close = () => {
    chrome.runtime.sendMessage({ event: `${this.name}-closed` });
    if (!this.open) return;

    this.frame.remove();

    this.open = false;
  };
}
