import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { index } from "../../services/search/DexieSearchIndex";
//@ts-ignore
import packageJson from '/package.json';

export const FooterBar: React.FC<{}> = ({ }) => {

  const postings = useLiveQuery(() => index.db.body.count())
  const docs = useLiveQuery(() => index.db.docs.count())

  return <div className="select-none fixed bottom-0 left-0 right-0 bg-ramp-100 px-2.5 py-1 text-sm text-ramp-700 flex place-content-between">
    <span className="text-left">7 tabs open (2323 total)  -  {postings ?? "(?)"} postings, {docs ?? "(?)"} docs</span>
    <span>
      v. {packageJson.version} <a className="underline" href="https://warpspacelabs.com/changelog">(changelog)</a>
    </span>
  </div>
}