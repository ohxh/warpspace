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

    document.addEventListener("visibilitychange", (e) => handlevis());
  }, [chatFocus]);

  // return <>{children}</>
  return chatFocus ? <div key={x}>{children}</div> : <>No Focus</>;
};