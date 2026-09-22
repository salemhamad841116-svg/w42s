import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useOrderbookStore } from '../../stores/orderbookStore';

const tickOptions = [0.01, 0.1, 1, 10, 50, 100];

const TickAggregator = React.memo(() => {
  const tickSize = useOrderbookStore((state: any) => state.tickSize || 0.01);
  const setTickSize = useOrderbookStore((state: any) => state.setTickSize || (() => {}));
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        className="flex items-center gap-1 text-xs hover:text-white bg-[#1C2030] px-2 py-1 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        {tickSize} <ChevronDown size={12} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-[#1C2030] border border-[#262B3D] rounded shadow-lg z-20 w-16">
            {tickOptions.map(option => (
              <button
                key={option}
                className="w-full text-left px-2 py-1 text-xs hover:bg-[#1E2336] text-[#8F9CAE] hover:text-white"
                onClick={() => {
                  setTickSize(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

export default TickAggregator;