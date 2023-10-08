import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { db } from "../../../services/database/DatabaseSchema";

export const WindowLink: React.FC<{ id: number }> = ({ id }) => {

  const window = useLiveQuery(() => db.windows.get(id))
  const nTabs = useLiveQuery(() => db.tabs.where("[windowId+status]").equals([id, "open"]).count())

  if (!window) return <>...</>
  return <a className={`font-medium border-b border-dashed border-ramp-500 ml-1`}>{window.title || "Untitled window"} ({nTabs} tabs)</a>
}