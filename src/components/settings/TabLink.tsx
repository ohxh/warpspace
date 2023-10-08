import {
  Tab,
  TabList,
  TabPanel,
  TabProps,
  TabStoreProps,
  useTabStore,
} from "@ariakit/react";
import React from "react";
import {
  useHref,
  useLinkClickHandler,
  useLocation,
  useNavigate
} from "react-router-dom";

export const TabLinkList = TabList;
export const TabLinkPanel = TabPanel;

type TabLinkProps = TabProps<"a"> & { to: string, icon?: React.ReactNode, label: React.ReactNode };

export function TabLink({ to, icon, label, ...props }: TabLinkProps) {
  const href = useHref(to);
  const onClick = useLinkClickHandler(to);
  return <Tab {...props} as="a" href={href} onClick={onClick} className="data-active-item:hover:bg-ramp-100 data-active-item:bg-ramp-100 data-active-item:dark:bg-ramp-200 hover:bg-ramp-100 dark:hover:bg-ramp-200 bg-ramp-0 dark:bg-ramp-100 relative pl-10 py-1.5 flex flex-row items-center" >
    {icon && <div className="absolute left-3" >{icon}</div>}{label}
  </Tab>
}

export function useTabLinkState(props: TabStoreProps = {}) {
  const { pathname: selectedId } = useLocation();
  const navigate = useNavigate();

  const tab = useTabStore({
    ...props,
    selectedId,
    setSelectedId: (id) => {
      // setSelectedId may be called more than once for the same id, so we make
      // sure we only navigate once.
      if (id !== selectedId) {
        navigate(id || "/");
      }
    },
  });

  return tab;
}



