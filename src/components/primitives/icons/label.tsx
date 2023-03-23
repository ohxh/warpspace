import React, { SVGProps } from "react";

export const LabelIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"{...props} ><path fill="currentColor" d="m17 10-3.542 4.438q-.229.27-.531.416-.302.146-.656.146H5.5q-.625 0-1.062-.438Q4 14.125 4 13.5v-7q0-.625.438-1.062Q4.875 5 5.5 5h6.771q.354 0 .656.146.302.146.531.416Z" /></svg>
}
