import React, { DetailedHTMLProps, SVGProps } from "react";

export const AddLinkIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"{...props} ><path fill="currentColor" d="M9.25 14H6q-1.667 0-2.833-1.167Q2 11.667 2 10q0-1.667 1.167-2.833Q4.333 6 6 6h3.25v1.5H6q-1.042 0-1.771.729Q3.5 8.958 3.5 10q0 1.042.729 1.771.729.729 1.771.729h3.25ZM7 10.75v-1.5h6v1.5ZM18 10h-1.5q0-1.042-.729-1.771Q15.042 7.5 14 7.5h-3.25V6H14q1.667 0 2.833 1.167Q18 8.333 18 10Zm-3.75 6.25V14H12v-1.5h2.25v-2.25h1.5v2.25H18V14h-2.25v2.25Z" /></svg>
}
