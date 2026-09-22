import React from 'react';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useOrderbookStore } from '../../stores/orderbookStore';
import clsx from 'clsx';
import TickAggregator from './TickAggregator';

const OrderBookHeader = React.memo(() => {
  const viewMode = useOrderbookStore((state: any) => state.viewMode || 'both');
  const setViewMode = useOrderbookStore((state: any) => state.setViewMode || (() => {}));

  return (
    <div className="flex flex-col border-b border-[#262B3D] bg-[#0B0E14] select-none text-xs text-[#8F9CAE]">
      <div className="flex items-center justify-between p-2 pb-1">
        <span className="font-semibold text-white">Order Book</span>
        <div className="flex items-center gap-2">
          <TickAggregator />
        </div>
      </div>
      
      <div className="flex items-center justify-between px-2 pb-2 mt-1">
        <div className="flex items-center gap-1 bg-[#151924] rounded p-0.5">
          <button 
            className={clsx("p-1 rounded", viewMode === 'bids' ? "bg-[#262B3D] text-[#00C087]" : "hover:bg-[#1E2336]")}
            onClick={() => setViewMode('bids')}
          >
            <AlignLeft size={14} />
          </button>
          <button 
            className={clsx("p-1 rounded", viewMode === 'both' ? "bg-[#262B3D] text-white" : "hover:bg-[#1E2336]")}
            onClick={() => setViewMode('both')}
          >
            <AlignCenter size={14} />
          </button>
          <button 
            className={clsx("p-1 rounded", viewMode === 'asks' ? "bg-[#262B3D] text-[#F23645]" : "hover:bg-[#1E2336]")}
            onClick={() => setViewMode('asks')}
          >
            <AlignRight size={14} />
          </button>
        </div>
      </div>

      <div className="flex items-center px-2 py-1 bg-[#151924]">
        <div className="flex-1 text-left">Price</div>
        <div className="flex-1 text-right">Amount</div>
        <div className="flex-1 text-right">Total</div>
      </div>
    </div>
  );
});

export default OrderBookHeader;
