import React, { SVGProps } from "react";

export const DragHandleIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"{...props} ><path fill="currentColor" d="M4 12.5V11h12v1.5ZM4 9V7.5h12V9Z" /></svg>
}
