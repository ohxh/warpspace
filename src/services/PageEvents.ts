export type PageEvent = ContentScrapedPageEvent;

/** Record scraped content from the sender tab */
export type ContentScrapedPageEvent = {
  type: "content-scraped";
  body: string;
};

/** Request a capture of the sender tab */
export type RequestCapturePageEvent = {
  type: "request-capture";
};
