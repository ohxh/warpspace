import React from "react";
import { BrandMenu } from "../../services/settings/BrandMenu";
import { FooterBar } from "./FooterBar";
import { HeaderBar } from "./HeaderBar";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../services/database/DatabaseSchema";
import { WindowPreview } from "../shared/WindowPreview";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Select, SelectItem } from "../primitives/Select";



export const NewTabApp: React.FC<{}> = ({ }) => {

  const openWindows = useLiveQuery(async () => await db.windows.where("status").equals("open").toArray());

  return <div className="flex flex-col w-[100vw] h-[100vh] inset-0 bg-ramp-0">
    <HeaderBar />
    <div className="p-24">
      <div className="flex flew-row place-content-center flex-wrap gap-y-12 gap-x-6">
        {openWindows?.map(s => <div>
          <WindowPreview window={s} key={s.id} />
        </div>)}
      </div>
    </div>

    <div className="w-20 bg-ramp-400">


    </div>

    <FooterBar />
  </div >
}