import React, { SVGProps } from "react";

export const AnchorIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"{...props} ><path fill="currentColor" d="M10.021 18q-1.104 0-2.344-.375-1.239-.375-2.271-1.063-1.031-.687-1.718-1.687-.688-1-.688-2.25V10l3 2.5-1.271 1.292q.792 1.104 1.959 1.802 1.166.698 2.562.864V9.5H7V8h2.25V6.896Q8.5 6.667 8 6.01q-.5-.656-.5-1.51 0-1.042.729-1.771Q8.958 2 10 2q1.042 0 1.771.729.729.729.729 1.771 0 .854-.5 1.51-.5.657-1.25.886V8H13v1.5h-2.25v6.958q1.396-.166 2.562-.875 1.167-.708 1.959-1.812L14 12.5l3-2.5v2.625q0 1.25-.688 2.25-.687 1-1.718 1.698-1.032.698-2.261 1.062-1.229.365-2.312.365ZM10 5.5q.417 0 .708-.292Q11 4.917 11 4.5t-.292-.708Q10.417 3.5 10 3.5t-.708.292Q9 4.083 9 4.5t.292.708q.291.292.708.292Z" /></svg>
}
