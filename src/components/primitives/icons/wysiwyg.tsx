import React, { SVGProps } from "react";

export const WysiwygIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"{...props} ><path fill="currentColor" d="M4.5 17q-.625 0-1.062-.438Q3 16.125 3 15.5v-11q0-.625.438-1.062Q3.875 3 4.5 3h11q.625 0 1.062.438Q17 3.875 17 4.5v11q0 .625-.438 1.062Q16.125 17 15.5 17Zm0-1.5h11V6h-11v9.5Zm2-5.5V8.5h7V10Zm0 3v-1.5h4V13Z" /></svg>
}