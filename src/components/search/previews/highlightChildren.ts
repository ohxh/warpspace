import React from "react";
import { highlightStringByRegex } from "./syntax-highlighting/highlightStringByRegex";

export const highlightChildren = (children: React.ReactNode, regex: RegExp) => {
  return React.Children.map(children, (child) => {
    if (typeof child === "string") return highlightStringByRegex(child, regex);
    return child;
  });
};
