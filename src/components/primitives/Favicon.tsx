import React, { DetailedHTMLProps, HTMLAttributes, useEffect, useState } from "react";
import { OpenVisit, Page, TrackedVisit, TrackedWindow, db } from "../../services/database/DatabaseSchema";
import { url } from "inspector";
import { CursorIcon } from "./icons/cursor";
import { useLiveQuery } from "dexie-react-hooks";
import { WindowIcon } from "@heroicons/react/20/solid";

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
    {/* {item.type === "visit" && item.status === "open" && item.chromeId !== currentTabId && <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-focus rounded-full" />} */}
    {item.type === "visit" && item.status === "open" && item.chromeId == currentTabId && <CursorIcon className="absolute -bottom-1 -right-1 w-3 h-3  text-focus drop-shadow-sm " />}
  </div>
};


export const SmartWindowIcon: React.FC<{ window: TrackedWindow }> = ({ window }) => {

  const currentTab = useLiveQuery(async () => (await db.tabs.where("chromeId").equals(currentTabId).toArray())[0])

  return <div className="relative w-5 h-5 ">
    <div className={"mt-0.5 w-[1.125rem] h-[1.125rem] rounded border-ramp-900 border-[0.1rem] bg-ramp-0 absolute shadow-sm"}
      style={{
        transform: "translateX(-7px) scale(0.8)"
      }}
    > <div className="h-0.5 w-full bg-ramp-900"></div></div>
    <div className={"mt-0.5 w-[1.125rem] h-[1.125rem] rounded border-ramp-900 border-[0.1rem] bg-ramp-0 absolute shadow-sm"}
      style={{
        transform: "translateX(-4px) scale(0.9)"
      }}
    > <div className="h-0.5 w-full bg-ramp-900"></div></div>
    <div className={"mt-0.5 w-[1.125rem] h-[1.125rem] rounded border-ramp-900 border-[0.1rem] bg-ramp-0 absolute"} >
      <div className="h-0.5 w-full bg-ramp-900"></div>
    </div>
    {/* {window.status === "open" && currentTab?.windowId !== window.id && <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 bg-focus rounded-full" />} */}
    {window.status === "open" && currentTab?.windowId === window.id && <CursorIcon className="absolute -bottom-1 -right-1 w-3 h-3  text-focus drop-shadow-sm" />}
  </div>
};


export const NewWindowIcon: React.FC<{ window: TrackedWindow }> = ({ window }) => {

  return <div className="relative w-5 h-5 ">
    <div className={"mt-0.5 w-[1.125rem] h-[1.125rem] rounded border-ramp-900 border-[0.1rem] bg-ramp-0 absolute shadow-sm"}
      style={{
        transform: "translateX(-7px) scale(0.8)"
      }}
    > <div className="h-0.5 w-full bg-ramp-900"></div></div>  </div>
};