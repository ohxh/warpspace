import React from "react";
import { Select, SelectItem } from "../primitives/Select";

export type SearchSortOrder = "relevance" | "date";

export const SortOrderDropdown: React.FC<{
  sortOrder: SearchSortOrder,
  setSortOrder: (sortOrder: SearchSortOrder) => void,
}> = ({ sortOrder, setSortOrder }) => {
  return <div className="w-20">
    <Select value="hi" onChange={() => { }}>
      <SelectItem value="relevance" label="Relevance" description="Sort by" />
      <SelectItem value="recent" label="Recent" description="Sort by time visitied" />
      <SelectItem value="hi2" label="Hi1" />
    </Select>
  </div>
}