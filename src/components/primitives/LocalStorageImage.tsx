import React, { useState, useEffect } from "react";
import { ImageStore } from "../../services/previews/ImageStore";
export interface LocalStorageImageProps extends React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
  srcKey: string;
  iref?: React.MutableRefObject<HTMLImageElement | null>
}
const x: ImageStore = new ImageStore();

const LocalStorageImageInner: React.FC<LocalStorageImageProps> = ({ srcKey, iref, ...props }) => {

  const [img, setImg] = useState<string>("data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");

  useEffect(() => {
    (async () => {
      setImg((
        srcKey ? await x.get(srcKey) : "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==")
        || "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");
    })()
  }, [srcKey])
  return <img alt={srcKey} onError={(e) => setImg("data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==")} {...props} ref={iref} src={img} />
}

export const LocalStorageImage = React.memo(LocalStorageImageInner)
