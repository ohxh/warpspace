import { Transition, Dialog } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import React, { Fragment } from "react";

export const SettingsPanel: React.FC<{ open: boolean, setOpen: (x: boolean) => void }> = ({ open, setOpen }) => {

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
              <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
                <div className="px-4 sm:px-6">
                  <div className="flex items-start justify-between">
                    <Dialog.Title className="text-lg font-medium text-gray-900">Settings</Dialog.Title>
                    <div className="ml-3 h-7 flex items-center">
                      <button
                        type="button"
                        className="bg-white rounded-md text-gray-500 hover:bg-gray-200 p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => setOpen(false)}
                      >
                        <span className="sr-only">Close panel</span>
                        <XIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-6 relative flex-1 px-4 sm:px-6">
                  {/* Replace with your content */}
                  <div className="absolute inset-0 px-4 sm:px-6">
                    <div className="h-full border-2 border-dashed border-gray-200" aria-hidden="true" />
                  </div>
                  {/* /End replace */}
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition.Root>

}