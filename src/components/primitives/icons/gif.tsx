import React, { SVGProps } from "react";

export const GifIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"{...props} ><path fill="currentColor" d="M10 12V8h1v4Zm-3.5 0q-.208 0-.354-.146T6 11.5v-3q0-.208.146-.354T6.5 8h2q.208 0 .354.146T9 8.5V9H7v2h1v-1h1v1.5q0 .208-.146.354T8.5 12Zm5.5 0V8h3v1h-2v.667h1.333v1H13V12Z" /></svg>
}
