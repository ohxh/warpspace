import { useState, useEffect } from "react";
import React from "react";

const FocusHider: React.FC = ({ children }) => {
  const [chatFocus, setChatFocus] = useState(!document.hidden);
  console.log("bbb");

  useEffect(() => {
    const handlevis = () => {
      if (document.hidden) {
        setChatFocus(false);
        console.log("blur");
      } else {
        setChatFocus(true);
        console.log("unblur");
      }
    };

    document.addEventListener("visibilitychange", (e) => handlevis());
  }, [chatFocus]);

  return chatFocus ? <>{children}</> : <>No Focus</>;
};
