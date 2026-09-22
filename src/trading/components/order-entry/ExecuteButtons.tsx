import React, { useState } from 'react';
import { useOrderEntryStore } from '../../stores/orderEntryStore';
import { usePositionsStore } from '../../stores/positionsStore';
import { useMarketStore } from '../../stores/marketStore';
import type { OrderData, OrderSide } from '../../types';

const ExecuteButtons = React.memo(() => {
  const submitOrder = useOrderEntryStore((state: any) => state.submitOrder || (async () => {
    return new Promise(resolve => setTimeout(resolve, 300));
  }));
  
  const [loadingLong, setLoadingLong] = useState(false);
  const [loadingShort, setLoadingShort] = useState(false);

  const handleExecute = async (side: 'buy' | 'sell') => {
    if (side === 'buy') setLoadingLong(true);
    else setLoadingShort(true);
    
    try {
      const entryState = useOrderEntryStore.getState();
      const currentPrice = useMarketStore.getState().ticker?.currentPrice ?? 67285.50;
      const price = parseFloat(entryState.price) || currentPrice;
      const amount = parseFloat(entryState.amount) || 0.1;
      const orderSide: OrderSide = side === 'buy' ? 'BUY' : 'SELL';

      const newOrder: OrderData = {
        id: `ord_${Date.now()}`,
        clientOrderId: `cl_${Date.now()}`,
        symbol: useMarketStore.getState().currentSymbol || 'BTC/USDT',
        side: orderSide,
        type: entryState.orderType || 'LIMIT',
        price: price,
        amount: amount,
        filled: 0,
        status: 'NEW',
        timeInForce: entryState.timeInForce || 'GTC',
        postOnly: entryState.postOnly || false,
        reduceOnly: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Add optimistic order to positions store (updates open orders & chart price lines instantly)
      usePositionsStore.getState().addOptimisticOrder(newOrder);

      await submitOrder({ side, price, amount });
    } finally {
      setLoadingLong(false);
      setLoadingShort(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full select-none">
      <button 
        className="w-full bg-[#00C087] hover:bg-[#00D99A] text-white font-bold py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-[48px]"
        onClick={() => handleExecute('buy')}
        disabled={loadingLong || loadingShort}
      >
        {loadingLong ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          "BUY / LONG BTC"
        )}
      </button>
      <button 
        className="w-full bg-[#F23645] hover:bg-[#FF4D5C] text-white font-bold py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-[48px]"
        onClick={() => handleExecute('sell')}
        disabled={loadingLong || loadingShort}
      >
        {loadingShort ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          "SELL / SHORT BTC"
        )}
      </button>
    </div>
  );
});

export default ExecuteButtons;
