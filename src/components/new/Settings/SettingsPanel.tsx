import { Transition, Dialog } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import React, { Fragment } from "react";
import { useAppSettings } from "./AppSettingsContext";


const colorSchemes = ["dark", "light", "black"] as const
export const SettingsPanel: React.FC<{ open: boolean, setOpen: (x: boolean) => void }> = ({ open, setOpen }) => {

  const [settings, updateSettings] = useAppSettings();

  return <Transition.Root show={open} as={Fragment}>
    <Dialog as="div" className="fixed inset-0 overflow-hidden" onClose={setOpen}>
      <div className="absolute inset-0 overflow-hidden">
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="absolute inset-0 bg-black bg-opacity-0 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-y-0 left-0 pr-10 max-w-full flex">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-in-out duration-200"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="w-screen max-w-md">
              <div className="h-full flex flex-col py-6 bg-background border-r border-gray-200 shadow-xl overflow-y-scroll">
                <div className="px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <Dialog.Title className="text-lg font-medium text-gray-900">Settings</Dialog.Title>
                    <div className="ml-3 h-7 flex items-center">
                      <button
                        type="button"
                        className="bg-white rounded-md text-gray-500 active:bg-gray-100 p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => setOpen(false)}
                      >
                        <span className="sr-only">Close panel</span>
                        <XIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-6">
                  <label className="text-base font-medium text-gray-900">Color Scheme</label>
                  <p className="text-sm leading-5 text-gray-500">How do you prefer to receive notifications?</p>
                  <fieldset className="mt-4">
                    <legend className="sr-only">Notification method</legend>
                    <div className="space-y-4">
                      {colorSchemes.map((colorScheme) => (
                        <div key={colorScheme} className="flex items-center">
                          <input
                            id={colorScheme}
                            type="radio"
                            checked={settings.colorTheme === colorScheme}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateSettings({ ...settings, colorTheme: colorScheme })
                              }
                            }}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 bg-purple"
                          />
                          <label htmlFor={colorScheme} className="ml-3 block text-sm font-medium text-gray-700">
                            {colorScheme}
                          </label>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div className="mt-6 relative flex-1 px-4 sm:px-6">
                  <label>
                    hi
                    <input type="checkbox"></input>
                  </label>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition.Root>

}