import React, { useMemo } from 'react';
import { useOrderEntryStore } from '../../stores/orderEntryStore';
import { Decimal } from 'decimal.js';

const RiskSummaryBox = React.memo(() => {
  const { amount, price, orderType } = useOrderEntryStore((state: any) => ({
    amount: state.amount || '0.500',
    price: state.price || '67285.50',
    orderType: state.orderType || 'Limit'
  }));

  const summary = useMemo(() => {
    try {
      const p = orderType === 'Market' ? '67285.50' : price;
      const val = new Decimal(amount || '0').mul(new Decimal(p || '0'));
      const fee = val.mul(0.0004); // 0.04% maker/taker
      return {
        value: val.toFixed(2),
        fee: fee.toFixed(2),
        liquidation: '59123.00',
        slippage: orderType === 'Market' ? '0.10%' : '0.00%'
      };
    } catch(e) {
      return { value: '0.00', fee: '0.00', liquidation: '-', slippage: '0.00%' };
    }
  }, [amount, price, orderType]);

  return (
    <div className="flex flex-col gap-2 bg-[#151924] rounded p-3 text-xs select-none">
      <div className="flex justify-between">
        <span className="text-[#8F9CAE]">Order Value</span>
        <span className="text-white">{summary.value} USDT</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[#8F9CAE]">Est. Fee</span>
        <span className="text-white">{summary.fee} USDT</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[#8F9CAE]">Est. Liquidation</span>
        <span className="text-[#F7931A]">{summary.liquidation}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[#8F9CAE]">Max Slippage</span>
        <span className="text-white">{summary.slippage}</span>
      </div>
    </div>
  );
});

export default RiskSummaryBox;
