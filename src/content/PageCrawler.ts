export class PageCrawler {
  window: Window;

  constructor(window: Window) {
    this.window = window;
    window.addEventListener("DOMContentLoaded", (event) => {
      this.crawlText();
    });
  }

  crawlImage() {}

  crawlText() {}
}
