import React from "react";

export const RadioControl: React.FC<{ value: string, onChange: (x: string) => void, label: string, description?: string, options: { value: string, label: string }[] }> = ({ options, value, onChange, label, description }) => {
  return (
    <div className="py-2 select-none">
      <label className="text-sm text-ramp-900 py-1">{label}</label>
      {description && <p className="text-sm leading-5 text-ramp-500">{description}</p>}
      <fieldset className="mt-2"
      >

        <div className="gap-x-4 flex flex-row flex-wrap">
          {options.map((option) => (
            <div key={option.value} className="flex items-center gap-x-2">
              <input

                id={option.value}
                name={label}
                type="radio"
                checked={value === option.value}
                onChange={e => onChange(option.value)}
                className="h-4 w-4 border-ramp-400 text-focus focus:ring-focus dark:bg-ramp-200 dark:checked:bg-focus"
              />
              <label htmlFor={option.value} className="block">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </div>
  )
}