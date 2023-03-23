import { CodeBracketIcon, ShieldCheckIcon, SparklesIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import React from "react";
import { MemoryRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Modal } from "../primitives/controls/Modal";
import { DatabaseIcon } from "../primitives/icons/database";
import { AccountTab } from "./AccountTab";
import { AppearanceTab } from "./AppearanceTab";
import { DeveloperTab } from "./DeveloperTab";
import { PrivacyTab } from "./PrivacyTab";
import { StorageTab } from "./StorageTab";
import { TabLink, TabLinkList, TabLinkPanel, useTabLinkState } from "./TabLink";

export const SettingsModal: React.FC<{
  open: boolean;
  setOpen: (x: boolean) => void;
}> = ({ open, setOpen }) => {

  return <Modal open={open} setOpen={setOpen}>
    <MemoryRouter>
      <SettingsModalInner />
    </MemoryRouter>
  </Modal>
};

export const SettingsModalInner: React.FC<{ returnButton?: React.ReactNode }> = ({ returnButton }) => {
  const tab = useTabLinkState();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="flex flex-row items-stretch h-full">

            <TabLinkList
              state={tab}
              className="flex flex-col w-64 border-r border-ramp-200 py-2 select-none"
              aria-label="Groceries"
            >
              {returnButton}
              <div className="text-xs uppercase tracking-wider text-ramp-500 pl-3 py-2">
                Account
              </div>
              <TabLink
                className="tab"
                id="/account"
                to="/account"
                label="Account"
                icon={<UserCircleIcon className="w-4 h-4" />}
              />
              <div className="text-xs uppercase tracking-wider text-ramp-500 pl-3 py-2">
                General
              </div>
              <TabLink
                className="tab"
                id="/appearance"
                to="/appearance"
                label="Appearance"
                icon={<SparklesIcon className="w-4 h-4" />}
              />
              <div className="text-xs uppercase tracking-wider text-ramp-500 pl-3 py-2">
                Advanced
              </div>
              <TabLink
                className="tab"
                id="/privacy"
                to="/privacy"
                label="Privacy"
                icon={<ShieldCheckIcon className="w-4 h-4" />}
              />
              <TabLink
                className="tab"
                id="/storage"
                to="/storage"
                label="Storage"
                icon={<DatabaseIcon className="w-4 h-4" />}
              />
              <TabLink
                className="tab"
                id="/developer"
                to="/developer"
                label="Developer"
                icon={<CodeBracketIcon className="w-4 h-4" />}
              />
            </TabLinkList>
            <div className="flex-1">
              <TabLinkPanel
                state={tab}
                tabId={tab.selectedId || undefined}
                className="py-4 px-6 overflow-scroll h-full"
              >
                <Outlet />
              </TabLinkPanel>
            </div>
          </div>
        }
      >
        <Route index element={<Navigate to="/account" />} />
        <Route path="/account" element={<AccountTab />} />
        <Route path="/appearance" element={<AppearanceTab />} />
        <Route path="/privacy" element={<PrivacyTab />} />
        <Route path="/storage" element={<StorageTab />} />
        <Route path="/developer" element={<DeveloperTab />} />
      </Route>
    </Routes>
  );
};


