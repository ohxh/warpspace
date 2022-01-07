import { SearchIcon } from "@heroicons/react/outline";
import React, { useState } from "react";
import { ActiveVisit } from "../../services/Database";
import { SearchResult } from "../Search/SearchResult";
import { SettingsPanel } from "../Settings/settings";
import { BrandMenu } from "./BrandMenu";


const commands = [{
  name: "Foo",
  command() { }
}, {
  name: "Bar",
  command() { }
}

];


export const Header: React.FC<{ tab: ActiveVisit }> = ({ tab }) => {

  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return <>
    <div className="w-full b absolute top-0 px-2 py-1 flex items-center text-gray-500 dark:text-gray-600 text-sm">
      <BrandMenu />
      <button className="px-2 py-1 hover:bg-gray-200" onClick={() => setSettingsOpen(true)}>
        Settings
      </button>
      <div className="flex-1"></div>

      <button className="group flex" onClick={() => setSearchOpen(true)}>
        <span className="group-hover:-translate-x-2 transition-transform duration-150">
          Start typing to search...
        </span>
        <SearchIcon className="w-5 h-5 text-gray-500 ml-4" />
      </button>
    </div>
    <SettingsPanel open={settingsOpen} setOpen={setSettingsOpen} />
    {searchOpen && <div className="fixed inset-48 rounded-lg z-20 bg-white pt-20 px-20">
      <SearchResult tab={tab} />
    </div>}
  </>

}