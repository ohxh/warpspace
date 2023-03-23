import React, { SVGProps } from "react";

export const FormatPaintIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"{...props} ><path fill="currentColor" d="M9.5 18.021q-.625 0-1.062-.438Q8 17.146 8 16.521v-3.5H5.5q-.625 0-1.062-.438Q4 12.146 4 11.521v-5.5q0-1.271.875-2.136Q5.75 3.021 7 3.021h9v8.5q0 .625-.448 1.062-.448.438-1.052.438H12v3.5q0 .625-.448 1.062-.448.438-1.052.438Zm-4-9.5h9v-4h-1v3H12v-3h-1v1.5H9.5v-1.5H7q-.625.041-1.062.448-.438.406-.438 1.052Z" /></svg>
}
