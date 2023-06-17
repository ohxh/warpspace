import React from "react";

export type SearchSortOrder = "relevance" | "date";

export const SortOrderDropdown: React.FC<{
  sortOrder: SearchSortOrder,
  setSortOrder: (sortOrder: SearchSortOrder) => void,
}> = ({ sortOrder, setSortOrder }) => {
  return <div className="px-2 py-1 rounded border border-ramp-200 text-ramp-700">Relevance</div>
}