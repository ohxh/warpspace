import React, { useMemo, useState } from 'react'
import ReactDOM from 'react-dom'

export const NotesApp = () => {
  return (
    <div className="bg-[#FEF6E7] w-full min-h-screen">
      <div className="mx-auto max-w-3xl w-full pt-20">
        <div className="w-full space-y-4 text-base">
          <h1 className="text-4xl">HTML Ipsum Presents</h1>

          <p><strong>Pellentesque habitant morbi tristique</strong>
            senectus et netus et malesuada <a href="#" className={"text-focus underline"}>fames ac turpis egestas</a>. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. <em>Aenean ultricies mi vitae est.</em> Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, <code>commodo vitae</code>, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. <a href="#">Donec non enim</a> in turpis pulvinar facilisis. Ut felis.</p>

          <h2>Header Level 2</h2>

          <ol>
            <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
            <li>Aliquam tincidunt mauris eu risus.</li>
          </ol>

          <blockquote><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna. Cras in mi at felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur massa. Donec eleifend, libero at sagittis mollis, tellus est malesuada tellus, at luctus turpis elit sit amet quam. Vivamus pretium ornare est.</p></blockquote>

          <h3>Header Level 3</h3>

          <ul>
            <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
            <li>Aliquam tincidunt mauris eu risus.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}