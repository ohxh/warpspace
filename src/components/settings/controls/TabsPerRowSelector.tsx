import React, { useState } from "react";

export const TabsPerRowSelector: React.FC<{
  value: number;
  onChange: (x: number) => void;
}> = ({ value, onChange }) => {
  const [hover, setHover] = useState<number | undefined>(undefined);

  return (
    <div className="py-2 select-none">
      <div>Tabs per row</div>
      <div className="flex flex-row mt-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            className="px-1"
            onMouseEnter={i > 3 ? () => setHover(i) : undefined}
            onMouseLeave={i > 3 ? () => setHover(undefined) : undefined}
          >
            <div
              className={`w-16 h-10 ${(hover ?? value) >= i
                ? " bg-ramp-200  border border-ramp-300 "
                : "border border-ramp-300"
                } rounded text-center pt-2 ${i > 3 ? "hover:bg-ramp-300 text-ramp-900 " : "text-ramp-500 "
                }`}
              onClick={() => onChange(i)}
            >
              {i}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};