import React, { SVGProps } from "react";

export const InventoryIcon: React.FC<SVGProps<SVGSVGElement>> = (props) => {
  return <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"{...props} ><path fill="currentColor" d="M9 17H4.5q-.667 0-1.083-.448Q3 16.104 3 15.5v-11q0-.625.479-1.062Q3.958 3 4.5 3h3.562q.209-.667.709-1.083Q9.271 1.5 10 1.5q.75 0 1.24.417.489.416.698 1.083H15.5q.667 0 1.083.438Q17 3.875 17 4.5V8h-1.5V4.5H14V7H6V4.5H4.5v11H9Zm3.833-1-3.521-3.542 1.063-1.062 2.458 2.479 4.605-4.604 1.062 1.062ZM10 4.5q.312 0 .531-.219.219-.219.219-.531 0-.312-.219-.531Q10.312 3 10 3q-.312 0-.531.219-.219.219-.219.531 0 .312.219.531.219.219.531.219Z" /></svg>
}
