import React, { SVGProps } from "react";

export const HighlightIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"{...props} ><path fill="currentColor" d="M4.771 6.917 3 5.146l1.062-1.063 1.771 1.771ZM9.25 4.5V2h1.5v2.5Zm5.979 2.417-1.062-1.063 1.771-1.771L17 5.146ZM8 18v-4l-2-2V8h8v4l-2 2v4Z" /></svg>
}
