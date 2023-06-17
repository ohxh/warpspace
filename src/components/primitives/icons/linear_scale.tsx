import React, { SVGProps } from "react";

export const LinearScaleIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"{...props} >
    <path fill="currentColor" d="M14 14q-1.479 0-2.573-.927-1.094-.927-1.365-2.323H5.854q-.229.542-.729.896T4 12q-.833 0-1.417-.583Q2 10.833 2 10q0-.833.583-1.417Q3.167 8 4 8q.625 0 1.125.354t.729.896h4.229q.271-1.396 1.355-2.323Q12.521 6 14 6q1.667 0 2.833 1.167Q18 8.333 18 10q0 1.667-1.167 2.833Q15.667 14 14 14Zm0-1.5q1.042 0 1.771-.729.729-.729.729-1.771 0-1.042-.729-1.771Q15.042 7.5 14 7.5q-1.042 0-1.771.729Q11.5 8.958 11.5 10q0 1.042.729 1.771.729.729 1.771.729Z" /></svg>
}