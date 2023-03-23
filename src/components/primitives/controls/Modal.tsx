import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import React, { Fragment } from "react";

export const Modal: React.FC<{
  open: boolean;
  setOpen: (x: boolean) => void;
  children?: React.ReactNode
}> = ({ open, setOpen, children }) => {

  return <Transition appear show={open} as={Fragment}>
    <Dialog as="div" className="relative z-10" onClose={() => { setOpen(false) }}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-150"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black bg-opacity-40" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-150"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden text-left align-middle transition-[transform,opacity]
            h-[32rem] bg-ramp-0 dark:bg-ramp-100 dark:border dark:border-ramp-200 rounded-lg ring-1 ring-black/5 shadow-2xl md:mb-20 lg:mb-36 xl:mb-48
            ">
              {children}
              <button
                type="button"
                onClick={() => { setOpen(false) }}
                className="absolute top-2 right-2 z-50 hover:bg-ramp-100 dark:hover:bg-ramp-200 p-1 rounded">
                <XMarkIcon className="text-ramp-900 w-5 h-5" />{" "}
              </button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
};