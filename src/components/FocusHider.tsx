import { useState, useEffect } from "react";
import React from "react";

export const FocusHider: React.FC = ({ children }) => {
  const [chatFocus, setChatFocus] = useState(!document.hidden);

  useEffect(() => {
    const handlevis = () => {
      if (document.hidden) {
        setChatFocus(false);
      } else {
        setChatFocus(true);
      }
    };

    document.addEventListener("visibilitychange", (e) => handlevis());
  }, [chatFocus]);

  return chatFocus ? <>{children}</> : <>No Focus</>;
};
