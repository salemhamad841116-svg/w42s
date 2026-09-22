import React from 'react';
import clsx from 'clsx';
import { useOrderEntryStore } from '../../stores/orderEntryStore';
import { OrderType } from '../../types';

const mainTypes: { id: OrderType; label: string }[] = [
  { id: 'LIMIT', label: 'Limit' },
  { id: 'MARKET', label: 'Market' },
  { id: 'STOP_LIMIT', label: 'Stop-Limit' },
];

const subTypes: { id: OrderType; label: string }[] = [
  { id: 'TRAILING_STOP', label: 'Trailing' },
  { id: 'OCO', label: 'OCO' },
];

const OrderTypeSelector = React.memo(() => {
  const orderType = useOrderEntryStore((state) => state.orderType);
  const setOrderType = useOrderEntryStore((state) => state.setOrderType);

  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="flex bg-[#1C2030] p-1 rounded">
        {mainTypes.map(item => {
          const isActive = orderType === item.id;
          return (
            <button
              key={item.id}
              className={clsx(
                "flex-1 text-xs font-semibold py-1.5 rounded transition-colors text-center cursor-pointer",
                isActive ? "bg-[#2962FF]/20 text-[#2962FF]" : "text-[#8F9CAE] hover:text-white"
              )}
              onClick={() => setOrderType(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="flex gap-4 px-1 text-xs font-semibold">
        {subTypes.map(item => {
          const isActive = orderType === item.id;
          return (
            <button
              key={item.id}
              className={clsx(
                "transition-colors cursor-pointer",
                isActive ? "text-[#2962FF]" : "text-[#8F9CAE] hover:text-white"
              )}
              onClick={() => setOrderType(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default OrderTypeSelector;
