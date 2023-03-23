import renderer from "markdown-it/lib/renderer";
import React from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import createHighlightedElement from "./createHighlightedElement";

export const HighlightedCode: React.FC<{ children: string, regex: RegExp, number: string }> = ({ children, regex, number }) => {

  function highlightRenderer({ rows, stylesheet, useInlineStyles }: any) {
    return rows.map((node: any, i: number) =>
      createHighlightedElement({
        node,
        stylesheet,
        useInlineStyles,
        key: `code-segement${i}`,
        regex,
      })
    );
  }

  //@ts-ignore
  return <SyntaxHighlighter
    wrapLongLines
    //@ts-ignore
    language="jsx" useInlineStyles={false} codeTagProps={{ style: { wordBreak: "break-all", }, "data-line-number": number }}
    renderer={highlightRenderer}
  >
    {children}
  </SyntaxHighlighter>
}