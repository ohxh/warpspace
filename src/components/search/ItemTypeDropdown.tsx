
import React from "react";
import { Select, SelectItem } from "../primitives/Select";
import toast from "react-hot-toast";

export const ItemTypeDropdown: React.FC<{}> = ({ }) => {
  return <Select value="hi" onChange={() => {

    toast("Changed item type. Undo...")
  }}>
    <SelectItem value="relevance" label="File" description="" />
    <SelectItem value="recent" label="Webpage" description="Sort by time visitied" />
    <SelectItem value="hi2" label="Window" />
  </Select>
}