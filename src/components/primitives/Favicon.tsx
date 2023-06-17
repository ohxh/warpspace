import React, { DetailedHTMLProps, HTMLAttributes, useEffect, useState } from "react";
import { OpenVisit, Page, TrackedVisit } from "../../services/database/DatabaseSchema";
import { url } from "inspector";
import { CursorIcon } from "./icons/cursor";

/** Chrome keeps an database of favicons that we can request.
 * Convert a webpage url to the URL of its favicon for our chrome extension.
 */
function chromeFaviconURL(u?: string, size = 32) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));

  if (u) {
    url.searchParams.set("pageUrl", u);
    url.searchParams.set("size", size.toString());
  } else {
    // TODO find a better way to get this
    url.searchParams.set("pageUrl", "https://example.org/");
    url.searchParams.set("size", size.toString());
  }

  return url.toString();
}

let currentTabId = 0;

chrome.tabs.getCurrent((c) => currentTabId = c!.id!);

function fallbackFaviconURL(u?: string, size = 32) {
  const url = new URL(chrome.runtime.getURL("/_favicon/"));

  if (u) {
    url.searchParams.set("pageUrl", u);
    url.searchParams.set("size", size.toString());
  } else {
    // TODO find a better way to get this
    url.searchParams.set("pageUrl", "https://example.org/");
    url.searchParams.set("size", size.toString());
  }

  return url.toString();
}


export interface FaviconProps extends DetailedHTMLProps<HTMLAttributes<HTMLImageElement>, HTMLImageElement> { url?: string }

export const Favicon: React.FC<FaviconProps> = ({ url, ...props }) => {
  const faviconUrl = chromeFaviconURL(url)

  return <img
    src={faviconUrl}
    className={"mt-0.5 w-[1.125rem] h-[1.125rem] rounded-sm"}
    {...props}
  />
};

export const SmartFavicon: React.FC<{ item: TrackedVisit | Page }> = ({ item }) => {

  const [faviconURL, setFaviconURL] = useState(item.metadata.faviconURL || chromeFaviconURL(item.url))

  useEffect(() => {
    setFaviconURL(item.metadata.faviconURL || chromeFaviconURL(item.url))
  }, [item])

  return <div className="relative">
    <img
      src={faviconURL}
      onError={() => setFaviconURL(chromeFaviconURL(item.url))}
      className={"mt-0.5 w-[1.125rem] h-[1.125rem] rounded-sm"}
    />
    {item.type === "visit" && item.status === "open" && item.chromeId !== currentTabId && <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-focus rounded-full" />}
    {item.type === "visit" && item.status === "open" && item.chromeId == currentTabId && <CursorIcon className="absolute -bottom-1 -right-1 w-3 h-3  text-focus " />}
  </div>
};