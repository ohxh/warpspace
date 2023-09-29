import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { TabPreview } from "./components/search/previews/TabPreview";
import { db, OpenVisit } from "./services/database/DatabaseSchema";
import "./styles/prose.css";
import "./styles/style.css";
import "./styles/theme.css";
import { normalizeURL } from "./utils/normalizeUrl";
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { createRoot } from "react-dom/client";



export const DebugPanel: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => {
  const [open, setOpen] = useState(false)

  return <div className="bg-black/70 font-mono text-white p-1 w-[24rem] flex flex-col">
    <div className="flex flex-row"  >
      <h2 className="flex-1">
        {title}
      </h2>
      <button className="p-2 rounded-full" onClick={() => setOpen(x => !x)}>{open ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="2-4 h-4" />}</button>
    </div>
    {open && children}
  </div>
}

export const Debug: React.FC = () => {

  const [chromeId, setChromeId] = useState(-1);

  useEffect(() => {
    chrome.tabs.getCurrent().then(t => {
      setChromeId(t.id!)
    })

  }, [])


  const tabs = useLiveQuery(() => db.tabs.where("chromeId").equals(chromeId).toArray(), [chromeId])

  const visits = useLiveQuery(() => tabs ? db.pages.where("url").equals(normalizeURL(tabs[0].url)).toArray() : [], [tabs])

  const tab = tabs?.[0] as OpenVisit;
  const visit = visits?.[0];

  if (!tab) return <></>
  if (!visit) return <></>
  return <>
    <div className=" absolute left-0 bottom-0 max-w-sm">
      <DebugPanel title="Current tab">
        <TabPreview tab={tab} />
        <pre className="overflow-scroll text-xs p-2 whitespace-pre-wrap">
          {JSON.stringify(tab, undefined, 1)}
        </pre>
      </DebugPanel>
    </div>

  </>
}

const root = createRoot(document.getElementById("root")!);

root.render(<React.StrictMode>
  <Debug />
</React.StrictMode>)