import { get, set } from "lodash";
import { useContext } from "react";
import { NestedKeyOf, NestedValue } from "../utils/nestedKeyOf";
import { WarpspaceSettings } from "../services/settings/settings";
import { appSettingsContext } from "../services/settings/WarpspaceSettingsContext";

export const useWarpspaceSettings = () => {
  return useContext(appSettingsContext);
};

export function useSetting<K extends NestedKeyOf<WarpspaceSettings>>(
  path: K
): NestedValue<WarpspaceSettings, K> {
  const [settings, updateSettings] = useContext(appSettingsContext);
  return get(settings, path);
}

export function useUpdateSetting<K extends NestedKeyOf<WarpspaceSettings>>(
  path: K
) {
  const [settings, updateSettings] = useContext(appSettingsContext);

  return (value: NestedValue<WarpspaceSettings, K>) => {
    set(settings, path, value);
    updateSettings(settings);
  };
}
