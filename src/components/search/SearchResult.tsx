import { XMarkIcon } from "@heroicons/react/20/solid";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { BaseSearchActionResult, SearchActionResult } from "../../services/search/results";
import { useSetting } from "../../hooks/useSetting";
import { Favicon, SmartFavicon } from "../primitives/Favicon";
import { highlightStringByRegex } from "./previews/syntax-highlighting/highlightStringByRegex";
import { WindowIcon } from "@heroicons/react/24/solid";

const highlightChildren = (children: React.ReactNode, regex: RegExp) => {
  return React.Children.map(children, (child) => {
    if (typeof child === "string") return highlightStringByRegex(child, regex)
    return child;
  })
};


const MarkdownInlinePreview: React.FC<{ text: any, regex: RegExp, children?: string }> = ({ text, regex }) => {

  return <div className="prose max-h-[1.6em]" >
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[[rehypeKatex, {
        macros: {
          "\displaystyle": ""
        }
      }]]}

      components={{
        a: ({ children, ...props }) => <a {...props}>{highlightChildren(children, regex)}</a>,

        blockquote: ({ children, ...props }) => <blockquote {...props}>{highlightChildren(children, regex)}</blockquote>,

        em: ({ children, ...props }) => <em {...props}>{highlightChildren(children, regex)}</em>,
        h1: ({ children, ...props }) => <h1 {...props}>{highlightChildren(children, regex)}</h1>,
        h2: ({ children, ...props }) => <h2 {...props}>{highlightChildren(children, regex)}</h2>,
        h3: ({ children, ...props }) => <h3 {...props}>{highlightChildren(children, regex)}</h3>,
        h4: ({ children, ...props }) => <h4 {...props}>{highlightChildren(children, regex)}</h4>,
        h5: ({ children, ...props }) => <h5 {...props}>{highlightChildren(children, regex)}</h5>,
        h6: ({ children, ...props }) => <h6 {...props}>{highlightChildren(children, regex)}</h6>,
        // img: ({ children, ...props }) => <a {...props}>{highlightChildren(children, regex)}</a>,
        // li: ({ children, ...props }) => < {...props}>{highlightChildren(children, regex)}</a>,
        // ol: ({ children, ...props }) => <a {...props}>{highlightChildren(children, regex)}</a>,
        p: ({ children, ...props }) => <p {...props}>{highlightChildren(children, regex)}</p>,
        // pre: ({ children, ...props }) => <a {...props}>{highlightChildren(children, regex)}</a>,
        strong: ({ children, ...props }) => <strong {...props}>{highlightChildren(children, regex)}</strong>,
        code: ({ children, }) => {
          //@ts-ignore
          let code = children[0] as string;
          const block = code.startsWith("|||")
          if (block) {
            let space = code.indexOf(" ")
            return <code>{highlightChildren(code.slice(space).trim(), regex)}</code>
          } else {
            return <code>{highlightChildren(code, regex)}</code>
          }
        }

      }}
    >{text}</ReactMarkdown >
  </div >
}


export const SearchResult: React.FC<{ item: SearchActionResult, active: boolean }> = ({ item, active }) => {
  let Icon = item.icon;
  const handleDelete = () => { }
  return <div
    style={{
      height: 40,//@ts-ignore
      paddingLeft: 16 + (item.isInline ?? 0) * 16,
      opacity: item.debug ? (item.debug.finalScore >= item.debug.threshold && !item.debug.duplicate ? 1 : 0.3) : 1,
    }}
    className={`group select-none ${active ? "bg-ramp-100 dark:bg-ramp-200" : "bg-ramp-0 dark:bg-ramp-100"} px-4 py-2 text-base flex flex-row items-center gap-x-3 w-full relative hover:z-50`}
  >
    {/* @ts-ignore */}
    {useSetting("developer.showSearchRankingReasons") && <div className="group absolute right-0 font-mono text-white bg-black/70 py-1 px-2 text-xs rounded mr-2 z-50">{item.debug?.duplicate && "(duplicate) "}  {(item.debug?.finalScore ?? 0).toFixed(3)}

    </div>}

    {item.type === "window" && <WindowIcon className="w-5 h-5" />}
    {(item.type === "page" || item.type === "visit") && <SmartFavicon item={item.item} />}
    {Icon && <Icon />}

    {/* @ts-ignore */}
    {item.allFrags && <h2 className="inline flex-1 max-w-none text-base text-ramp-900 overflow-ellipsis whitespace-nowrap overflow-hidden prose prose-headings:text-base prose-headings:font-base prose-a:font-normal prose-a:no-underline prose-a:border-b prose-a:border-dashed prose-a:border-ramp-500">
      {/* @ts-ignore */}
      <MarkdownInlinePreview text={item.allFrags[item.index]} regex={item.debug.regex} />
    </h2>}


    {/* @ts-ignore */}
    {!item.allFrags && <h2 className="inline flex-1 max-w-none text-base text-ramp-900 overflow-ellipsis whitespace-nowrap overflow-hidden">
      {highlightChildren(item.title, item.debug.regex)}
      {!item.title?.trim() && <span className="text-base text-ramp-900 overflow-hidden overflow-ellipsis whitespace-nowrap">{highlightChildren(item.url, item.debug.regex)}</span>}
      {item.type === "window" && !item.title && <span className="text-ramp-500">Untitled space</span>}
    </h2>}

    {handleDelete && active &&
      <div className={`opacity-100
            absolute right-0 top-0 bottom-0 
            flex flex-row items-center
            pl-6 bg-gradient-to-r from-transparent
            via-ramp-100 to-ramp-100`}>
        <button
          tabIndex={-1}
          className="rounded-full p-1 mr-1 tab-x-button active:bg-ramp-200"
          onClickCapture={async (e) => {
            e.stopPropagation()
            handleDelete?.()
          }}
        >
          <XMarkIcon className="w-4 h-4 text-ramp-800"></XMarkIcon>
        </button>
      </div>}

    {/* <span className="text-ramp-500 text-sm overflow-hidden overflow-ellipsis whitespace-nowrap">{item.url.value}</span> */}
  </ div>
}

export const SearchSectionHeading: React.FC<{ title: string }> = ({ title }) => {
  return <div className="px-4 py-2.5 uppercase text-xs tracking-wider text-ramp-500">
    {title === "page" && "tab"}
    {!["visit", "page"].includes(title) && title}
  </div>
}

// export function highlightMarkdown(md: string, highlight: [number, number][]) {
//   let offset = 0;

//   highlight.forEach(([start, end]) => {
//     md = md.slice(0, start + offset) + "**" + md.slice(start + offset)
//     offset += 2;
//     md = md.slice(0, end + offset) + "**" + md.slice(end + offset)
//     offset += 2;
//   })

//   return md;
// }

const stackTitles = (index: number, frags: string[]) => {
  return frags[index];
  // const prefix = frags[index].match(/^(##?#?#?#?#?)\s/)

  // if (prefix) {
  //   let res = frags[index].slice(prefix[0].length)
  //   let lvl = prefix[1].length;
  //   for (let i = index - 1; i >= 0; i--) {
  //     if (lvl === 1) break;
  //     const prefix2 = frags[i].match(new RegExp("(#" + "#?".repeat(lvl - 2) + ")\\s"))
  //     if (prefix2) {
  //       res = frags[i].slice(prefix2[0].length) + " > " + res
  //       lvl = prefix2[1].length;
  //       break;
  //     }
  //   }
  //   return "#".repeat(prefix[1].length) + " " + res
  // } else return frags[index]

}