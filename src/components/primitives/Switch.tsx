import { Switch } from "@headlessui/react";
import React from "react";


function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}


export const SwitchControl: React.FC<{ value: boolean, onChange: (x: boolean) => void, label: string, description?: string }> = ({ value, onChange, label, description }) => {

  return (
    <Switch.Group as="div" className="flex items-center justify-between py-2 select-none">
      <span className="flex flex-grow flex-col">
        <Switch.Label as="span" className="text-sm text-ramp-900" passive>
          {label}
        </Switch.Label>
        {description && <Switch.Description as="span" className="text-sm text-ramp-500">
          {description}
        </Switch.Description>}
      </span>
      <Switch
        checked={value}
        onChange={onChange}
        className={classNames(
          value ? 'bg-focus' : 'bg-ramp-300',
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2'
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            value ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-ramp-0 shadow ring-0 transition duration-200 ease-in-out'
          )}
        />
      </Switch>
    </Switch.Group>
  )
}