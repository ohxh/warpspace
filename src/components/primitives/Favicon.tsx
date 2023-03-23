import React, { DetailedHTMLProps, HTMLAttributes } from "react";

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

export interface FaviconProps extends DetailedHTMLProps<HTMLAttributes<HTMLImageElement>, HTMLImageElement> { url?: string }

export const Favicon: React.FC<FaviconProps> = ({ url, ...props }) => {
  const faviconUrl = chromeFaviconURL(url)

  return <img
    src={faviconUrl}
    className={"mt-0.5 w-[1.125rem] h-[1.125rem] rounded-sm"}
    {...props}
  />
};