import React, { SVGProps } from "react";

export const PersonIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"{...props} ><path fill="currentColor" d="M10 10q-1.25 0-2.125-.875T7 7q0-1.25.875-2.125T10 4q1.25 0 2.125.875T13 7q0 1.25-.875 2.125T10 10Zm-6 6v-2q0-.479.26-.906.261-.427.719-.719 1.146-.667 2.427-1.021Q8.688 11 10 11q1.312 0 2.594.354 1.281.354 2.427 1.021.458.271.719.708.26.438.26.917v2Z" /></svg>
}
