import React, { useContext } from "react";
import { ActiveVisit } from "../../services/Database";

export const tabSelectionContext = React.createContext<ActiveVisit[]>([])

export const useTabSelection = () => useContext(tabSelectionContext);