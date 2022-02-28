import React, { useState, useEffect } from "react";

export const FocusHider: React.FC = ({ children }) => {
  const [chatFocus, setChatFocus] = useState(!document.hidden);
  const [x, setX] = useState(0);

  useEffect(() => {
    const handlevis = () => {
      if (document.hidden) {
        setChatFocus(false);
      } else {
        // setTimeout(() => {
        setChatFocus(true);
        setX(x => x + 1);
        // }, 10);
      }
    };

    const handleZoomOut = (m: MessageEvent) => {
      if (m.data.event === "exit-warpspace") {
        setChatFocus(false);
        setTimeout(() => setChatFocus(true));
        setX(x => x + 1)
      }
    }

    document.addEventListener("visibilitychange", (e) => handlevis());
    window.addEventListener("message", (m) => handleZoomOut(m));
  }, [chatFocus]);

  // return <>{children}</>
  return chatFocus ? <div key={x}>{children}</div> : <>No Focus</>;
};