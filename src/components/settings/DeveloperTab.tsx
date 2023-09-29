import React from "react";
import { RadioControl } from "../primitives/Radio";
import { SwitchControl } from "../primitives/Switch";
import { useSetting, useUpdateSetting } from "../../hooks/useSetting";

export const DeveloperTab: React.FC<{}> = ({ }) => {
  return (
    <div>
      <RadioControl
        value={useSetting("developer.logLevel")}
        onChange={useUpdateSetting("developer.logLevel") as (x: string) => void}
        label="Log level"
        description="Level of logs to print in console"
        options={[
          { label: "None", value: "none" },
          { label: "Debug", value: "debug" },
          { label: "Info", value: "info" },
          { label: "Warning", value: "warning" },
          { label: "Error", value: "error" },
        ]}
      />
      <SwitchControl
        label="Debug Draw"
        description="Draw an overlay with warpspace debug information."
        value={useSetting("developer.showDebugUI")}
        onChange={useUpdateSetting("developer.showDebugUI")}
      />
      <SwitchControl
        label="Show hidden results"
        description="Draw an overlay with warpspace debug information."
        value={useSetting("developer.showHiddenResults")}
        onChange={useUpdateSetting("developer.showHiddenResults")}
      />
      <SwitchControl
        label="Show ranking reasons"
        description="Draw an overlay with warpspace debug information."
        value={useSetting("developer.showSearchRankingReasons")}
        onChange={useUpdateSetting("developer.showSearchRankingReasons")}
      />
    </div>
  );
}