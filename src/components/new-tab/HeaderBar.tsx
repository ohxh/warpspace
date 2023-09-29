import React from "react";
import { BrandMenu } from "../../services/settings/BrandMenu";
import { KeyCap } from "../primitives/KeyCap";

export const HeaderBar: React.FC<{}> = ({ }) => {
  return <><div className="fixed top-0 left-0 right-0  px-1.5 py-1 text-sm h-6"><BrandMenu /></div>
    <div className="fixed top-0 right-0 px-2.5 py-1 text-sm h-6 hover:-translate-x-2 transition-transform text-ramp-500">
      <KeyCap>Cmd</KeyCap> +  <KeyCap>Shift</KeyCap> + <KeyCap>1</KeyCap> to search...
    </div></>

}