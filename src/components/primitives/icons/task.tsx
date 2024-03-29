import React, { SVGProps } from "react";

export const TaskIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"{...props} ><path fill="currentColor" d="m9.146 15 4.604-4.604-1.125-1.125-3.479 3.479-1.688-1.708-1.146 1.125ZM5.5 18q-.625 0-1.062-.438Q4 17.125 4 16.5v-13q0-.625.438-1.062Q4.875 2 5.5 2H12l4 4v10.5q0 .625-.438 1.062Q15.125 18 14.5 18ZM11 7h3.5L11 3.5Z" /></svg>
}
