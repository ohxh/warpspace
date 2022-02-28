import { Menu, Transition } from "@headlessui/react"
import React, { Fragment } from "react"
import logo from "./logo.png"



function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}


export const BrandMenu: React.FC<{}> = ({ }) => {
  return <Menu as="div" className="relative inline-block text-left">
    <div>
      <Menu.Button className="rounded p-1 flex items-center hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500">
        <span className="sr-only">Open options</span>
        <img src={logo} className="w-5 h-5" aria-hidden={true} />

      </Menu.Button>
    </div>

    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className="z-10 bg-[#fff] bg-opacity-100 border origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-xl focus:outline-none">
        <div className="px-4 py-3">
          <p className="text-sm">Signed in as</p>
          <p className="text-sm font-medium text-gray-900 truncate">tom@example.com</p>
        </div>
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={classNames(
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                  'block px-4 py-1 text-sm'
                )}
              >
                Account settings
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={classNames(
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                  'block px-4 py-1 text-sm'
                )}
              >
                Support
              </a>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <a
                href="#"
                className={classNames(
                  active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                  'block px-4 py-1 text-sm'
                )}
              >
                License
              </a>
            )}
          </Menu.Item>
        </div>
        <div className="py-1">
          <form method="POST" action="#">
            <Menu.Item>
              {({ active }) => (
                <button
                  type="submit"
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block w-full text-left px-4 py-1 text-sm'
                  )}
                >
                  Sign out
                </button>
              )}
            </Menu.Item>
          </form>
        </div>

      </Menu.Items>
    </Transition>
  </Menu>
}