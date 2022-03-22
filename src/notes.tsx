import React, { useMemo, useState } from 'react'
import ReactDOM from 'react-dom'
import { createEditor, Descendant } from 'slate'
import { Slate, Editable, withReact, ReactEditor } from 'slate-react'

const App = () => {
  const initialValue: Descendant[] = [
    {
      type: 'paragraph',
      children: [{ text: 'A line of text in a paragraph.' }],
    } as Descendant,
  ]
  const editor = useMemo(() => withReact(createEditor() as ReactEditor), [])
  const [value, setValue] = useState<Descendant[]>(initialValue)
  return (
    <Slate editor={editor} value={value} onChange={setValue}>
      <Editable />
    </Slate>
  )
}


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
