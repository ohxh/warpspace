import React, { useEffect, useMemo, useState } from "react";
import { ActiveVisit } from "../../services/Database";
import { ImageStore } from "../../services/ImageStore";

const ITab: React.FC<{ tab: ActiveVisit }> = ({ tab }) => {
  return <button className="group grid-tab w-full cursor-default text-left bg-none" draggable>
    <div className={`relative bg-gray-100 aspect-[16/9] w-full  rounded-md ${tab.state.active ? "zoomout" : ""}`}>
      {tab.crawl.lod == 1 && tab.crawl.previewImage && <LocalStorageImage srcKey={tab.crawl.lod === 1 ? (tab.crawl.previewImage || "none") : "none2"} className="absolute inset-0 rounded-md object-cover h-full w-full" />}
      <div className="absolute inset-0 rounded-md border border-gray-300"></div>
      <div className="absolute inset-0 rounded-md bg-black opacity-0 group-active:opacity-40 transition-opacity duration-[50ms]"></div>

    </div>

    <div className="flex flex-row pt-2 gap-x-2 items-center px-[1px]">
      {tab.metadata.favIconUrl && <img src={tab.metadata.favIconUrl} alt="hi" className="w-4 h-4 rounded-sm bg-[#fff]"></img>}
      <span className="flex-1 text-ellipsis whitespace-nowrap overflow-hidden text-[14px] antialiased text-gray-900" >
        {tab.metadata.title ?? "New Tab"}
      </span>
    </div>
  </button>
}

export const Tab = React.memo(ITab)

export interface LocalStorageImageProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  srcKey: string;
}
const x: ImageStore = new ImageStore();

export const LocalStorageImage: React.FC<LocalStorageImageProps> = ({ srcKey, ...props }) => {


  const [img, setImg] = useState<string>();
  const result = useEffect(() => {
    (async () => {
      setImg(srcKey ? await x.get(srcKey) : "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");
      console.log("IMAGE IN COMP IS", srcKey, await x.get(srcKey) || "");
    })()
  }, [srcKey])
  return <img {...props} src={img} />
}

(async () => {
  console.log("CONTS", await chrome.storage.local.get())
})()