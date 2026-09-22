import React, { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useOrderEntryStore } from '../../stores/orderEntryStore';

const chips = [25, 50, 75, 100];

export const PercentageSlider: React.FC = React.memo(() => {
  const percentage = useOrderEntryStore((state: any) => state.percentage || 0);
  const calculatePercentage = useOrderEntryStore((state: any) => state.calculatePercentage || (() => {}));
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updatePercentageFromMouse = (e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const p = Math.round((x / rect.width) * 100);
    calculatePercentage(p);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) updatePercentageFromMouse(e);
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="flex flex-col gap-3 select-none">
      <div 
        ref={sliderRef}
        className="relative h-1 bg-[#262B3D] rounded-full mt-2 cursor-pointer"
        onMouseDown={(e) => {
          setIsDragging(true);
          updatePercentageFromMouse(e);
        }}
      >
        <div 
          className="absolute left-0 top-0 h-full bg-[#2962FF] rounded-full pointer-events-none" 
          style={{ width: `${percentage}%` }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow border border-[#2962FF] pointer-events-none"
          style={{ left: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between gap-1">
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => calculatePercentage(chip)}
            className={clsx(
              "flex-1 py-1 text-[11px] rounded transition-colors",
              percentage === chip 
                ? "bg-[#2962FF] text-white font-medium" 
                : "bg-[#1E2336] text-[#8F9CAE] hover:text-white"
            )}
          >
            {chip}%
          </button>
        ))}
      </div>
    </div>
  );
});

export default PercentageSlider;