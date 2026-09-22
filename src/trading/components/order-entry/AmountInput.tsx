import React, { useMemo } from 'react';
import { useOrderEntryStore } from '../../stores/orderEntryStore';
import { Minus, Plus } from 'lucide-react';
import { Decimal } from 'decimal.js';

const AmountInput = React.memo(() => {
  const { amount, setAmount, price, orderType } = useOrderEntryStore((state: any) => ({
    amount: state.amount || '0.500',
    setAmount: state.setAmount || (() => {}),
    price: state.price || '67285.50',
    orderType: state.orderType || 'Limit'
  }));

  const step = 0.001; 

  const handleMinus = () => {
    try {
      const val = new Decimal(amount || '0').minus(step);
      if (val.gte(0)) setAmount(val.toFixed(3));
    } catch(e) {}
  };

  const handlePlus = () => {
    try {
      const val = new Decimal(amount || '0').plus(step);
      setAmount(val.toFixed(3));
    } catch(e) {}
  };

  const quoteEquivalent = useMemo(() => {
    try {
      const p = orderType === 'Market' ? '67285.50' : price;
      return new Decimal(amount || '0').mul(new Decimal(p || '0')).toFixed(2);
    } catch(e) {
      return '0.00';
    }
  }, [amount, price, orderType]);

  return (
    <div className="flex flex-col gap-1 select-none">
      <div className="flex items-center justify-between text-xs">
        <label className="text-[#8F9CAE]">Amount (BTC)</label>
      </div>
      
      <div className="flex items-center h-[36px] bg-[#1C2030] border border-[#262B3D] rounded overflow-hidden transition-colors focus-within:border-[#2962FF]">
        <input 
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="flex-1 bg-transparent px-2 text-sm text-white outline-none min-w-0"
        />
        
        <div className="flex items-center gap-1 pr-1 text-[#8F9CAE]">
          <span className="text-xs px-1">BTC</span>
          <button className="p-1 hover:text-white hover:bg-[#1E2336] rounded" onClick={handleMinus}>
            <Minus size={14} />
          </button>
          <button className="p-1 hover:text-white hover:bg-[#1E2336] rounded" onClick={handlePlus}>
            <Plus size={14} />
          </button>
        </div>
      </div>
      
      <div className="text-[11px] text-[#8F9CAE] mt-0.5">
        ≈ {quoteEquivalent} USDT
      </div>
    </div>
  );
});

export default AmountInput;
