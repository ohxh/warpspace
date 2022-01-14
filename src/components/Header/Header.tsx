import { Menu } from "@headlessui/react";
import { SearchIcon } from "@heroicons/react/outline";
import React, { useState } from "react";
import { ActiveVisit } from "../../services/Database";
import { SettingsPanel } from "../new/Settings/SettingsPanel";
import { SearchResult } from "../Search/SearchResult";
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
    {searchOpen &&
      <div className="fixed inset-0 grid place-items-center z-50 pb-64">
        <div className=" m-auto w-2/3 rounded-lg z-50 bg-background relative ring-[1px] ring-[#000]/10 shadow-xl">
          <div className="w-full">
            <input className="text-2xl text-gray-900 placeholder:text-gray-300 w-full h-full px-6 py-6 focus:outline-none" placeholder="search"></input>
          </div>
          <div className="flex h-20">

          </div>
        </div>
      </div>}

    {/* <div className="bg-[#bbb] backdrop-blur-xl rounded-lg border absolute top-0 w-48 h-20"></div> */}
  </>

}
