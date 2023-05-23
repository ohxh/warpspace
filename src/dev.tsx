import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

import "./styles/prose.css";
import "./styles/style.css";
import "./styles/theme.css";
import { createRoot } from "react-dom/client";

export const DevToolsPage: React.FC<{}> = ({ }) => {

  const [text, setText] = useState("");

  useEffect(() => {

    chrome.devtools.inspectedWindow.eval("{x: window.scrapeElement($0)}", { useContentScriptContext: true }, (result: any, error: any) => {
      setText(result || "")
    })

    chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
      chrome.devtools.inspectedWindow.eval("{x: window.scrapeElement($0)}", { useContentScriptContext: true }, (result: any, error: any) => {
        setText(result || "")
      })
    })
  })

  return <>
    <div className="flex flex-col absolute top-0 bottom-0 theme-light theme">
      <pre className="flex-1 overflow-scroll rounded px-4 py-2 bg-ramp-100 border border-ramp-200 m-2 whitespace-pre">
        {text}
      </pre>
      <div className="flex-1 overflow-scroll prose prose-display">
        <ReactMarkdown>{text.replaceAll("\n", "\n\n")}</ReactMarkdown>
      </div>
    </div>

  </>
}

const root = createRoot(document.getElementById("root")!);

root.render(<React.StrictMode>
  <DevToolsPage />
</React.StrictMode>)