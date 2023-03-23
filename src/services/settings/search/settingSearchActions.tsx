import { NestedKeyOf, NestedValue } from "../../../utils/nestedKeyOf";
import { rank } from "../../search/rank";
import { SearchAction } from "../../search/results";
import { makeSearch } from "../../search/search";
import { WarpspaceSettings } from "../settings";

let colorSetting: SettingsEntry<"appearance.theme"> = {
  title: "Color scheme",
  type: "multi",
  path: "appearance.theme",
  options: [
    {
      title: "Light",
      value: "light",
    },
    {
      title: "Dark",
      value: "dark",
    }
  ]
}

export const settingSearchActions: SearchAction[] = makeSettingSearchActions([
  {
    title: "Appearance",
    entries: [
      colorSetting
    ]
  }
])

export type SettingsEntry<K extends NestedKeyOf<WarpspaceSettings>> = {
  type: "multi"
  path: K;
  title: string,
  options: SettingsOption<NestedValue<WarpspaceSettings, K>>[]
} | {
  type: "modal"
  title: string,
  value: React.FunctionComponent,
}

export type SettingsOption<T> = {
  value: T,
  title: string,
  description?: string,
  preview?: React.FunctionComponent,
}

export type SettingsGroup = {
  entries: SettingsEntry<any>[];
  title: string;
  description?: string;
}

function makeSettingSearchActions(groups: SettingsGroup[]): SearchAction[] {
  return groups.map(g => {
    return ({
      id: g.title,
      title: g.title,
      body: groupText(g),
      type: "setting" as const,
      url: "",
      children: async (query: string) => makeSearch(
        query,
        g.entries.map(e => {
          return ({
            id: e.title,
            title: e.title,
            body: entryText(e),
            type: "setting" as const,
            url: "",

            ...(e.type === "multi" ? {
              children: async (query: string) => makeSearch(
                query,
                e.options.map(e => {
                  return ({
                    title: e.title,
                    id: e.title,
                    url: "",
                    body: e.description || "",
                    type: "setting" as const
                  })
                })
              )
            } : {
              perform: () => alert(e.title)
            })
          })
        })
      )
    })
  })
}

function entryText(g: SettingsEntry<any>): string {
  return g.type === "multi" ? (g.title + g.options.map(o => o.title).join(" ")) : (g.title + g.value)
}

function groupText(g: SettingsGroup) {
  return g.entries.map(entryText).join("\n")
}
