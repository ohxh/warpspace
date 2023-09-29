

import ReactMarkdown from 'react-markdown';

import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { HighlightedCode } from "./syntax-highlighting/highlightedCode";
import { useVirtualizer } from '@tanstack/react-virtual';
import * as React from 'react';
import { highlightChildren } from './highlightChildren';
import 'katex/dist/katex.min.css'; // `rehype-katex` does not import the CSS for you
import { highlight } from 'refractor';



const fake = /never-mathches-anything/g;

export const VirtualizedPreview: React.FC<{ frags: string[], startIndex: number, regex: RegExp }> = ({
  frags, startIndex, regex
}) => {

  const [loaded, setLoaded] = React.useState(startIndex === 0)
  // alert("virtualized")
  const parentRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    paddingEnd: 200,
    paddingStart: 20,
    count: frags.length,
    overscan: 5,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 30,
  })

  React.useEffect(() => {
    setLoaded(false)
    let i = startIndex;
    virtualizer.scrollToIndex(i, { align: 'start', behavior: "auto" })

    setTimeout(() => {
      const { startIndex, endIndex } = virtualizer.range;

      const isVisible = i >= startIndex && i <= endIndex;

      if (isVisible) {
        setLoaded(true)
      } else {
        setTimeout(() => setLoaded(true), 50)
      }
    }, 50);
  }, [startIndex])

  const items = virtualizer.getVirtualItems()

  return (

    <div
      ref={parentRef}
      className={`List px-4 ${loaded ? "opacity-100 transition-opacity duration-75" : "opacity-0 "}`}
      style={{
        height: 400,
        overflowY: 'auto',
        contain: 'strict',
      }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${items[0].start}px)`,
          }}
        >
          {items.map((virtualRow) => (
            <div
              key={virtualRow.index}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
            >
              <div >
                {/* @ts-ignore */}
                <MarkdownLinePreview key={virtualRow.index} index={virtualRow.index} regex={virtualRow.index === startIndex ? regex || fake : fake} highlight={virtualRow.index === startIndex}>{frags[virtualRow.index] || " "}</MarkdownLinePreview>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

  )
}

const MarkdownLinePreview: React.FC<{ children: string, highlight: boolean, regex: RegExp }> = React.memo(({ children, highlight, regex }) => {
  return <div className={`leading-normal prose prose-display`}>
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        img: () => <></>,

        a: ({ children, ...props }) => <a {...props}>{highlightChildren(children, regex)}</a>,
        //@ts-ignore
        blockquote: ({ children, ...props }) => <a {...props}>{highlightChildren(children, regex)}</a>,

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
            return <><HighlightedCode regex={regex} number={code.slice(3, space)}>{code.slice(space)}</HighlightedCode></>
            return <pre><code><span className="text-ramp-400">{code.slice(3, space)}</span>{highlightCode(code.slice(space))}</code></pre>
          } else {
            return <code>{highlightChildren(code, regex)}</code>
          }
        }
      }}
    >{children}</ReactMarkdown >
  </div >
});

export function highlightCode(code: string) {
  return code.split("**").map((x, i) => i % 2 === 0 ? x : <strong>{x}</strong>)
}

