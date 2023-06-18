import React from "react";
import ReactDOM from "react-dom";
import ReactMarkdown from "react-markdown";
import { remark } from "remark";
import RemarkPlainText from "remark-plain-text";
import { DataObjectIcon } from "../../../components/primitives/icons/data_object";
import { HashtagIcon } from "../../../components/primitives/icons/hashtag";
import { LinkIcon } from "../../../components/primitives/icons/link";
import { NotesIcon } from "../../../components/primitives/icons/notes";
import { Page } from "../../database/DatabaseSchema";
import { getLiveSettings } from "../../settings/WarpspaceSettingsContext";
import { index } from "../DexieSearchIndex";
import { rank } from "../rank";
import { CommandSearchActionResult, groupResults, SearchActionResult, SearchCandidate, } from "../results";
import { SearchFunction } from "../search";

const parser = remark();
parser.use(RemarkPlainText)

const plaintext = (x: string) => {
  return x.replaceAll(/(\[[\s\S]+?\])(\((https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})\))/gim, (m, p1) => p1)
}

export const makePageSearch: (w: Page) => SearchFunction =
  (w: Page,) => {
    let commands: SearchActionResult[];

    return async (query: string, maskedQuery?: string, max: number = Infinity) => {
      console.log("makePageSearch: " + maskedQuery)
      const settings = await getLiveSettings();

      if (!commands) {
        const page = await index.get(w.searchId);
        const frags = page?.body.split("\n").filter(Boolean) || [];


        console.log({ frags, filterd: frags.filter(x => x.match(/[a-z0-9]/gim)) })

        commands =
          frags
            .map((s, i) => ({
              id: i.toString(),
              title: plaintext(s),
              body: "",
              //@ts-ignore
              allFrags: frags,
              //@ts-ignore
              index: i,
              url: "",
              type: "content",
              boost: (s.startsWith("###")
                ? 1.14
                : s.startsWith("##")
                  ? 1.16
                  : s.startsWith("#")
                    ? 1.2
                    : 1) * (1 + 1 / (i / 100 + 1) * 0.3),
              icon: s.startsWith("[")
                ? LinkIcon
                : s.startsWith("#")
                  ? HashtagIcon
                  : s.startsWith("```")
                    ? DataObjectIcon
                    : NotesIcon,
              perform: async () => {
                const el = document.createElement("div");

                ReactDOM.render(<ReactMarkdown>{s}</ReactMarkdown>, el);

                const id = await chrome.tabs.create({
                  url:
                    page?.url + `#:~:text=${encodeURIComponent(el.innerText.trim())}`,
                });

                ReactDOM.unmountComponentAtNode(el);
                el.remove();
              },
            })) || [];

        commands = commands.filter(x => x.title.match(/[a-z0-9]/gim))
      }

      const items: SearchCandidate[] = [];

      let ranked: any;


      ranked = rank(query, [...items, ...commands], settings.developer.showHiddenResults, maskedQuery || "")
        .filter((x) => x.debug.finalScore >= (settings.developer.showHiddenResults ? -Infinity : x.debug.threshold));;
      // }

      return groupResults(ranked);
    }
  };
