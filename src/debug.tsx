import { useLiveQuery } from "dexie-react-hooks";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { TabPreview } from "./components/search/previews/TabPreview";
import { db, OpenVisit } from "./services/database/DatabaseSchema";
import "./styles/prose.css";
import "./styles/style.css";
import "./styles/theme.css";
import { normalizeURL } from "./utils/normalizeUrl";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { createRoot } from "react-dom/client";


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

  if (!tab) return <>... tab {chromeId}</>
  if (!visit) return <>... visit</>
  return <>

    <div className=" bg-black/70 font-mono text-white p-4 absolute left-0 bottom-0 max-w-sm">
      <TabPreview tab={tab} />
      <pre className="overflow-scroll text-xs p-2 whitespace-pre-wrap">
        {JSON.stringify(tab, undefined, 1)}
      </pre>
    </div>

  </>
}

const root = createRoot(document.getElementById("root")!);

root.render(<React.StrictMode>
  <Debug />
</React.StrictMode>)