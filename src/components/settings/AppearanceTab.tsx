import React from "react";
import { RadioControl } from "../primitives/Radio";
import { useSetting, useUpdateSetting } from "../../hooks/useSetting";
import { ThemeRadio } from "./controls/ThemeRadio";

export const AppearanceTab: React.FC<{}> = ({ }) => {
  return <div>
    {/* <ThemeRadio value={useSetting("appearance.theme") as any} onChange={useUpdateSetting("appearance.theme")} /> */}
    <RadioControl
      label="Animations"
      value={useSetting("appearance.animations")}
      onChange={useUpdateSetting("appearance.animations") as any}
      options={[
        { label: "Smooth", value: "smooth" },
        { label: "Minimal", value: "minimal" },
        { label: "None", value: "none" },
      ]}
    />
    <RadioControl
      label="Width"
      value={useSetting("appearance.width")}
      onChange={useUpdateSetting("appearance.width") as any}
      options={[
        { label: "Normal", value: "normal" },
        { label: "Wide", value: "wide" },

      ]}
    />
    <RadioControl
      label="Position"
      value={useSetting("appearance.position")}
      onChange={useUpdateSetting("appearance.position") as any}
      options={[
        { label: "Top", value: "top" },
        { label: "Center", value: "center" },
      ]}
    />
  </div>
}