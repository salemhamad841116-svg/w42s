import React from 'react';
import { useOrderEntryStore } from '../../stores/orderEntryStore';
import { Minus, Plus } from 'lucide-react';
import clsx from 'clsx';
import { Decimal } from 'decimal.js';

const PriceInput = React.memo(() => {
  const { orderType, price, setPrice } = useOrderEntryStore((state: any) => ({
    orderType: state.orderType || 'Limit',
    price: state.price || '67285.50',
    setPrice: state.setPrice || (() => {})
  }));

  const isMarket = orderType === 'Market';
  const tickSize = 0.5; // From asset context usually

  const handleMinus = () => {
    if (isMarket || !price) return;
    try {
      setPrice(new Decimal(price).minus(tickSize).toFixed(2));
    } catch(e) {}
  };

  const handlePlus = () => {
    if (isMarket || !price) return;
    try {
      setPrice(new Decimal(price).plus(tickSize).toFixed(2));
    } catch(e) {}
  };

  return (
    <div className="flex flex-col gap-1 select-none">
      <div className="flex items-center justify-between text-xs">
        <label className="text-[#8F9CAE]">Price</label>
      </div>
      
      <div className={clsx(
        "flex items-center h-[36px] bg-[#1C2030] border border-[#262B3D] rounded overflow-hidden transition-colors focus-within:border-[#2962FF]",
        isMarket && "opacity-50 cursor-not-allowed"
      )}>
        <input 
          type="text"
          value={isMarket ? 'Market Price' : price}
          onChange={(e) => !isMarket && setPrice(e.target.value)}
          disabled={isMarket}
          className="flex-1 bg-transparent px-2 text-sm text-white outline-none min-w-0"
        />
        
        {!isMarket && (
          <div className="flex items-center gap-1 pr-1 text-[#8F9CAE]">
            <span className="text-xs px-1">USDT</span>
            <button className="p-1 hover:text-white hover:bg-[#1E2336] rounded" onClick={handleMinus}>
              <Minus size={14} />
            </button>
            <button className="p-1 hover:text-white hover:bg-[#1E2336] rounded" onClick={handlePlus}>
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default PriceInput;
