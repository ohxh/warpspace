import { XMarkIcon } from "@heroicons/react/20/solid";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { BaseSearchActionResult, SearchActionResult, WindowSearchActionResult } from "../../services/search/results";
import { useSetting, useUpdateSetting } from "../../hooks/useSetting";
import { Favicon, SmartFavicon, SmartWindowIcon } from "../primitives/Favicon";
import { highlightStringByRegex } from "./previews/syntax-highlighting/highlightStringByRegex";
import { WindowIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import { useLiveValue } from "../../services/database/DatabaseSchema";

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
      //@ts-ignore
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


export const SearchResult: React.FC<{ item: SearchActionResult, active: boolean, selected: boolean }> = ({ item, active, selected }) => {
  let Icon = item.icon;
  const settings = useSetting("privacy.exclusions")
  const updateExclusions = useUpdateSetting("privacy.exclusions")

  const handleDelete = () => {
    updateExclusions([...settings, item.url])
    toast((t) => (
      <div >
        <div className="mb-2 break-all">
          <span>
            Added <b>{item.title}</b> <span className="break-all max-lines-3 overflow-clip">{item.url}</span> to exclusion list.
          </span>
        </div>
        <button className="hover:bg-white/10 rounded-sm float-right px-2 py-1" onClick={() => {
          updateExclusions(settings)
          toast.dismiss(t.id)
        }
        }><span className="border-b border-dashed border-ramp-500">Exclude all from "google.com/"
          </span></button>
        <button className="hover:bg-white/10 rounded-sm float-right px-2 py-1" onClick={() => {
          updateExclusions(settings)
          toast.dismiss(t.id)
        }
        }><span className="border-b border-dashed border-ramp-500">Undo
          </span></button>
      </div>

    ),)
  }

  if (item.type === "window") {
    return <WindowSearchResult result={item} active={active} selected={selected} />
  }
  return <div
    style={{
      height: 40,//@ts-ignore
      paddingLeft: 16,
      // opacity: item.debug ? (item.debug.finalScore >= item.debug.threshold && !item.debug.duplicate ? 1 : 0.3) : 1,
    }}
    className={`group select-none ${selected ? (active ? "bg-highlight" : "bg-highlightFaint dark:bg-ramp-100") : (active ? "bg-ramp-100 dark:bg-ramp-200" : "bg-ramp-0 dark:bg-ramp-100")} px-4 py-2 text-base flex flex-row items-center gap-x-3 w-full relative hover:z-50
     ${item.type === "page" && Date.now() - (item.visits[0]?.attachedAt?.getTime() || 0) < 2000 && "opacity-0 animate-fadeInSlow"}`}
  >
    {/* @ts-ignore */}
    {useSetting("developer.showSearchRankingReasons") && <div className="group absolute right-0 font-mono text-white bg-black/70 py-1 px-2 text-xs rounded mr-2 z-50">{item.debug?.duplicate && "(duplicate) "}  {(item.debug?.finalScore ?? 0).toFixed(3)}

    </div>}


    {(item.type === "page") && <SmartFavicon item={item.visits[0] || item.item} />}
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
    </h2>}

    {handleDelete && active && item.type === "page" &&
      <div className={`opacity-100
            absolute right-0 top-0 bottom-0 
            flex flex-row items-center
            pl-6 bg-gradient-to-r from-transparent
            ${selected ? "via-highlight to-highlight" : "via-ramp-100 to-ramp-100"}`}>
        <button
          tabIndex={-1}
          className={`rounded-full p-1 mr-1 tab-x-button active:bg-ramp-200`}
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

export const WindowSearchResult: React.FC<{ result: WindowSearchActionResult, active: boolean, selected: boolean }> = ({ result, active, selected }) => {
  const window = useLiveValue(result.item)

  return <div
    style={{
      height: 40,//@ts-ignore
      paddingLeft: 16
      // opacity: item.debug ? (item.debug.finalScore >= item.debug.threshold && !item.debug.duplicate ? 1 : 0.3) : 1,
    }}
    className={`group select-none ${selected ? (active ? "bg-highlight" : "bg-highlightFaint dark:bg-ramp-100") : (active ? "bg-ramp-100 dark:bg-ramp-200" : "bg-ramp-0 dark:bg-ramp-100")} px-4 py-2 text-base flex flex-row items-center gap-x-3 w-full relative hover:z-50`}
  >
    {/* @ts-ignore */}
    {useSetting("developer.showSearchRankingReasons") && <div className="group absolute right-0 font-mono text-white bg-black/70 py-1 px-2 text-xs rounded mr-2 z-50">{item.debug?.duplicate && "(duplicate) "}  {(item.debug?.finalScore ?? 0).toFixed(3)}

    </div>}

    <SmartWindowIcon window={window} />


    {/* @ts-ignore */}
    <h2 className="inline flex-1 max-w-none text-base text-ramp-900 overflow-ellipsis whitespace-nowrap overflow-hidden">
      {highlightChildren(window.title, result.debug.regex)}
      {!window.title && <span className="text-ramp-500">Untitled window</span>}
      {/* @ts-ignore */}
      <span className="text-ramp-500 ml-1 text-sm">· {result.ntabs} tab{result.ntabs > 1 && "s"}</span>
    </h2>

    {/* {handleDelete && active && item.type === "page" &&
      <div className={`opacity-100
            absolute right-0 top-0 bottom-0 
            flex flex-row items-center
            pl-6 bg-gradient-to-r from-transparent
            ${selected ? "via-highlight to-highlight" : "via-ramp-100 to-ramp-100"}`}>
        <button
          tabIndex={-1}
          className={`rounded-full p-1 mr-1 tab-x-button active:bg-ramp-200`}
          onClickCapture={async (e) => {
            e.stopPropagation()
            handleDelete?.()
          }}
        >
          <XMarkIcon className="w-4 h-4 text-ramp-800"></XMarkIcon>
        </button>
      </div>} */}

    {/* <span className="text-ramp-500 text-sm overflow-hidden overflow-ellipsis whitespace-nowrap">{item.url.value}</span> */}
  </ div>
}