import { Menu } from "@headlessui/react";
import { CogIcon, SearchIcon } from "@heroicons/react/solid";
import React, { useState } from "react";
import { SearchModal } from "../new/Search/SearchModal";
import { SettingsPanel } from "../new/Settings/SettingsPanel";
import { ShortcutsPanel } from "../new/Settings/ShortcutsPanel";
import { BrandMenu } from "./BrandMenu";

const commands = [{
  name: "Foo",
  command() { }
}, {
  name: "Bar",
  command() { }
}

];


export const Header: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  return <>
    <div className="w-full b absolute top-0 px-2 py-1 flex items-center text-gray-500  dark:text-gray-600 text-sm z-40">
      <BrandMenu />
      <button className="px-1 py-1 hover:bg-gray-200 rounded-sm" onClick={() => setSettingsOpen(true)}>
        <CogIcon className="w-5 h-5" />
      </button>
      <button className="px-2 py-1 hover:bg-gray-200 rounded-sm" onClick={() => setShortcutsOpen(true)}>
        Shortcuts
      </button>
      <div className="flex-1"></div>

      <button className="group flex items-center px-2" onClick={() => setSearchOpen(true)}>
        <span className="group-hover:-translate-x-2 transition-transform duration-150">
          Start typing to search...
        </span>
        <SearchIcon className="w-4 h-4 text-gray-500 ml-4" />
      </button>
    </div>
    <SettingsPanel open={settingsOpen} setOpen={setSettingsOpen} />
    <ShortcutsPanel open={shortcutsOpen} setOpen={setShortcutsOpen} />
    {searchOpen &&
      <SearchModal />
    }

    {/* <div className="bg-[#bbb] backdrop-blur-xl rounded-lg border absolute top-0 w-48 h-20"></div> */}
  </>

}
