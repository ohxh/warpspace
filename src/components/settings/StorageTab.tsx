import React, { useEffect, useState } from "react";
import { SwitchControl } from "../primitives/controls/Switch";

/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
function humanFileSize(bytes: number, si = true, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}


// console.log(humanFileSize(1551859712))  // 1.4 GiB
// console.log(humanFileSize(5000, true))  // 5.0 kB
// console.log(humanFileSize(5000, false))  // 4.9 KiB
// console.log(humanFileSize(-10000000000000000000000000000))  // -8271.8 YiB
// console.log(humanFileSize(999949, true))  // 999.9 kB
// console.log(humanFileSize(999950, true))  // 1.0 MB
// console.log(humanFileSize(999950, true, 2))  // 999.95 kB
// console.log(humanFileSize(999500, true, 0))  // 1 MB

export const StorageTab: React.FC<{}> = ({ }) => {
  const [storage, setStorage] = useState<StorageEstimate>()
  const [storage2, setStorage2] = useState<number>()
  useEffect(() => {
    navigator.storage.estimate().then(t => setStorage(t))
    chrome.storage.local.getBytesInUse().then(t => setStorage2(t))
  }, [])

  const search = (storage?.usage || 0);
  const images = (storage2 || 0)
  const total = search + images;
  return (
    <div>
      {storage && <>
        <div className="py-2">
          <div className="text-sm text-ramp-900">
            Storage use <span className="text-sm text-ramp-500">
              ({humanFileSize(search + images)})<br />
            </span>
          </div>
          {/* <div className="text-xs text-ramp-500">
            {JSON.stringify(storage)}
          </div> */}

          <div className="w-full h-1.5 mt-2 rounded-full bg-ramp-200 flex flex-row overflow-clip">
            <div
              className="h-full bg-green"
              style={{
                width: `${(images / (search + images)) * 100}%`,
              }}
            />
            <div
              className=" h-full bg-orange"
              style={{
                width: `${(search / (search + images)) * 100}%`,
              }}
            />

          </div>

          <div className="flex flex-col mt-2">
            <div className="flex flex-row pt-2 gap-x-2 items-center" >
              <div className="w-3 h-3 rounded-full bg-green"></div>
              <div className="text-sm text-ramp-900">
                Preview Images <span className="text-ramp-500">({humanFileSize(images)})</span>
              </div>
            </div>
            <div className="flex flex-row pt-2 gap-x-2 items-center">
              <div className="w-3 h-3 rounded-full bg-orange"></div>
              <div className="text-sm text-ramp-900">
                Search Index <span className="text-ramp-500">({humanFileSize(search)})</span>
              </div>
            </div>
          </div>
        </div>
      </>}
      <SwitchControl
        label="Save full text"
        description="Save full text of every website for better ranking"
        value={true}
        onChange={() => { }}
      />
    </div>
  );

}