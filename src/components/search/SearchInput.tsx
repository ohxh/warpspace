export const KBAR_LISTBOX = "kbar-listbox";
export const getListboxItemId = (id: number) => `kbar-listbox-item-${id}`;
import React from "react";

export const SearchInput: React.FC<{
  query: string,
  setQuery: (x: string) => void
  placeholder?: string,
  showing: boolean,
  onKeyDown: React.KeyboardEventHandler<HTMLInputElement>
}> = ({ query, placeholder, showing, setQuery, onKeyDown }) => {

  return <input
    autoFocus
    autoComplete="off"
    role="combobox"
    spellCheck="false"
    aria-expanded={showing}
    aria-controls={KBAR_LISTBOX}
    aria-activedescendant={"1" /* TODO */}
    value={query}
    placeholder={placeholder}
    onChange={(event) => {
      setQuery(event.target.value);
    }}
    onKeyDown={onKeyDown}
    className="flex-1 text-base text-ramp-900 py-3 w-full outline-none"
  />

}