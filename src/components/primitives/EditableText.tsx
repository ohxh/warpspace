import React, { useState } from "react";
import { EditIcon } from "./icons/edit";
import { CheckIcon } from "@heroicons/react/20/solid";

export const EditableText: React.FC<{ value: string, onChange: (x: string) => void | Promise<void>, children: React.ReactNode }> = ({ children, value, onChange }) => {
  const [editing, setEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value)

  if (editing) {
    return <span>
      <form onSubmit={async (e) => {
        onChange(tempValue)
        setEditing(false)
      }}>
        <input
          onKeyDown={(e) => {
            alert(e.key)
            if (e.key === "Enter") {
              setEditing(false)
              onChange(tempValue)
            }
          }}
          className="p-0 m-0 mr-1 outline-none focus:ring-2 rounded ring-focus ring-offset-1"
          value={tempValue} onChange={(x) => setTempValue(x.target.value)} autoFocus
        />
        <button type="submit" className="inline-block text-ramp-400 hover:text-ramp-900 rounded-full">
          <CheckIcon className="w-4 h-4" />
        </button>
      </form>
    </span >
  } else
    return <span>
      {children}
      <button onClick={() => {
        setTempValue(value)
        setEditing(true)
      }} className="align-bottom inline-block text-ramp-400 hover:text-ramp-900 rounded-full p-1">
        <EditIcon className="w-4 h-4" />
      </button>
    </span>
}