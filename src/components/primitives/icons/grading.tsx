import React, { SVGProps } from "react";

export const GradingIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"{...props} ><path fill="currentColor" d="M3 17v-1.5h7V17Zm0-3.125v-1.5h7v1.5Zm0-3.125v-1.5h14v1.5Zm0-3.125v-1.5h14v1.5ZM3 4.5V3h14v1.5ZM13.458 17l-2.125-2.125 1.063-1.063 1.062 1.063 2.48-2.479L17 13.458Z" /></svg>
}
