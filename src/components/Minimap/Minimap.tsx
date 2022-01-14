import React from "react";
import { HydratedWindow } from "../../services/TabStore";
import "./minimap.css"
export const Minimap: React.FC<{
  browserState: HydratedWindow[];
  scrollState: { top: number, left: number, width: number, height: number };
  minimapVisible: boolean;
}> = ({
  browserState,
  scrollState,
  minimapVisible
}) => {
    return <div
      className={`fixed bottom-2 right-2 transition-opacity duration-300 ${minimapVisible ? "" : "opacity-0"
        }`}
      style={{ height: `${document.body.clientHeight / 10}px` }}
    >
      <div
        className="border border-gray-600 rounded absolute"
        style={{
          transform: `translate(${scrollState.left / 10}px, ${scrollState.top / 10}px)`,
          width: `${scrollState.width / 10}px`,
          height: `${scrollState.height / 10}px`,
        }}
      />
      <div
        className="flex items-start py-2 pb-8 "
        style={{
          paddingLeft: "calc(var(--carousel-edge-padding)/10)",
          paddingRight: "calc(var(--carousel-edge-padding)/10)",
        }}
      >
        {browserState.map((w, i) => (
          <div className="minimap-tab-grid minimap-window mt-3" key={w.id}>
            {w.tabs.map((t) => (
              <div
                className="aspect-[16/10] rounded-sm bg-gray-300"
                key={t.id}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>;
  }