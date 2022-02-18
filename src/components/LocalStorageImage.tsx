import React, { useState, useEffect } from "react";
import { ImageStore } from "../services/ImageStore";

export interface LocalStorageImageProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  srcKey: string;
  iref?: React.MutableRefObject<HTMLImageElement | null>
}
const x: ImageStore = new ImageStore();

export const LocalStorageImage: React.FC<LocalStorageImageProps> = ({ srcKey, iref, ...props }) => {


  const [img, setImg] = useState<string>();
  const result = useEffect(() => {
    (async () => {
      setImg(srcKey ? await x.get(srcKey) : "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");

    })()
  }, [srcKey])
  return <img {...props} ref={iref} src={img} />
}
