import React from 'react';
import clsx from 'clsx';
import DepthBar from './DepthBar';
import { useOrderEntryStore } from '../../stores/orderEntryStore';

interface OrderBookRowProps {
  price: number;
  amount: number;
  total: number;
  maxTotal: number;
  side: 'bid' | 'ask';
}

const OrderBookRow = React.memo(({ price, amount, total, maxTotal, side }: OrderBookRowProps) => {
  const fillFromOrderbook = useOrderEntryStore((state: any) => state.fillFromOrderbook || (() => {}));
  const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  
  return (
    <div 
      className="relative flex items-center h-[24px] px-2 text-[11px] font-mono hover:bg-[#1E2336] cursor-pointer transition-colors"
      onClick={() => fillFromOrderbook(price, amount)}
    >
      <DepthBar percentage={percentage} side={side} />
      
      <div className={clsx("flex-1 text-left z-10", side === 'bid' ? "text-[#00C087]" : "text-[#F23645]")}>
        {price.toFixed(2)}
      </div>
      <div className="flex-1 text-right text-white z-10">
        {amount.toFixed(4)}
      </div>
      <div className="flex-1 text-right text-white z-10">
        {total.toFixed(4)}
      </div>
    </div>
  );
});

export default OrderBookRow;
