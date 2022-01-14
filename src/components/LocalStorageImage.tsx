import React, { useState, useEffect } from "react";
import { ImageStore } from "../services/ImageStore";

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

