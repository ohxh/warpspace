import { PencilIcon } from "@heroicons/react/solid";
import React, { useState } from "react";

export const EditableText: React.FC<{
  value?: string;
  onChange: (x: string | undefined) => void;
  placeholder: string;
}> = ({ value, onChange, placeholder }) => {
  const [state, setState] = useState<string | undefined>(value);
  const [editing, setEditing] = useState(false);

  const open = () => {
    setState(value);
    setEditing(true);
  }

  const commit = () => {
    onChange(state);
    setEditing(false);
  }
  if (editing)
    return (
      <input
        className="text-gray-900 placeholder:text-gray-300 text-4xl w-full rounded-sm ring-0 outline-none focus:ring-2 ring-offset-2 ring-focus"
        autoFocus
        placeholder={placeholder}
        value={state}
        onChange={(e) => setState(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
      />
    );
  if (!editing)
    return (
      <span
        className="group flex items-baseline w-full"
        onClick={open}
      >
        {value && (
          <h1 className="text-gray-900 text-4xl whitespace-nowrap overflow-ellipsis">
            {value}
          </h1>
        )}
        {!value && <h1 className="text-gray-300 text-4xl">{placeholder}</h1>}
        <PencilIcon className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 ml-2" />
      </span>
    );
  return <></>;
};
