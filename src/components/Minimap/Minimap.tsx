import React, { useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { HydratedWindow } from "../../services/TabStore";
import "./minimap.css"

export const Minimap: React.FC<{
  browserState: HydratedWindow[];
  scrollState: { top: number, left: number, width: number, height: number };
  minimapVisible: boolean;
  pingVisible: () => void;
}> = ({
  browserState,
  scrollState,
  minimapVisible,
  pingVisible
}) => {

    const [dragging, setDragging] = useState(false);

    return <div
      className={`fixed bottom-2 right-2 transition-opacity duration-300 ${(minimapVisible || dragging) ? "" : "opacity-0"
        }`}
      style={{ height: `${document.body.clientHeight / 10}px` }}
    >
      <div
        className={`border border-gray-600 rounded absolute pointer-events-none transition-opacity
        ${dragging ? "opacity-0" : "opacity-100"}
        `}
        style={{
          transform: `translate(${scrollState.left / 10}px, ${scrollState.top / 10}px)`,
          width: `${scrollState.width / 10}px`,
          height: `${scrollState.height / 10}px`,
        }}
      />

      <ReactSortable
        onStart={() => setDragging(true)}
        onEnd={() => {
          setDragging(false)
          pingVisible()
        }}
        list={browserState}
        setList={() => { }}
        group="minimap"
        selectedClass="sortable-selected"
        ghostClass="sortable-ghost"
        dragClass="sortable-drag"
        animation={150}
        className="flex flex-row items-stretch py-1 pb-4"
        style={{
          paddingLeft: "calc(var(--carousel-edge-padding)/10)",
          paddingRight: "calc(var(--carousel-edge-padding)/10)",
        }}
      >
        {browserState.map((w, i) => (
          <div key={w.id}>
            <div className="pt-1 pb-4 sortable-drag:bg-background rounded-md sortable-ghost:opacity-0 minimap-window h-full">
              <div className="w-full">
                {w.type === "full" && <div className="text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-full">{w.title}</div>}
                {w.type === "anonymous" && <div className="text-gray-300 overflow-hidden text-ellipsis whitespace-nowrap">Untitled space</div>}
              </div>
              <div className="minimap-tab-grid mt-2" key={w.id}>
                {w.tabs.map((t) => (
                  <div
                    className="aspect-[16/10] rounded-sm bg-gray-300"
                    key={t.id}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </ReactSortable>
    </div>;
  }