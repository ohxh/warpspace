import React, { SVGProps } from "react";

export const PublicIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"{...props} ><path fill="currentColor" d="M10 18q-1.646 0-3.104-.625-1.458-.625-2.552-1.719t-1.719-2.552Q2 11.646 2 10q0-1.667.625-3.115.625-1.447 1.719-2.541Q5.438 3.25 6.896 2.625T10 2q1.667 0 3.115.625 1.447.625 2.541 1.719 1.094 1.094 1.719 2.541Q18 8.333 18 10q0 1.646-.625 3.104-.625 1.458-1.719 2.552t-2.541 1.719Q11.667 18 10 18Zm-1-1.583V15q-.417 0-.708-.292Q8 14.417 8 14v-1L3.646 8.646q-.063.333-.104.666Q3.5 9.646 3.5 10q0 2.458 1.583 4.26Q6.667 16.062 9 16.417Zm6-2.271q-1.188 1.187-1.094.948.094-.24.667-1.136.573-.896 1.25-2.073T16.5 10q0-2.042-1.115-3.656Q14.271 4.729 12.5 4v.5q0 .625-.438 1.062Q11.625 6 11 6H9v1q0 .417-.292.708Q8.417 8 8 8H7v2h5q.417 0 .708.292.292.291.292.708v2h.854q.479 0 .813.333.333.334.333.813Z" /></svg>
}
