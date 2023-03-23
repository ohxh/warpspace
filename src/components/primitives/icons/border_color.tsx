import React, { SVGProps } from "react";

export const BorderColorIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"{...props} ><path fill="currentColor" d="M2 20v-4h16v4Zm2-6v-3l6.625-6.625 3 3L7 14Zm10.688-7.688-3-3 1.02-1.02Q13 2 13.417 2q.416 0 .708.292l1.583 1.583q.292.292.282.698-.011.406-.282.719Z" /></svg>
}
