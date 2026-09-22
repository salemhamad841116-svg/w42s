import React, { useEffect } from 'react';
import { wsManager } from './services/wsManager';
import { TradingLayout } from './components/layout/TradingLayout';
import { useMarketStore } from './stores/marketStore';
import { useOrderbookStore } from './stores/orderbookStore';
import { useBrokerStore } from './stores/brokerStore';

const TradingApp: React.FC = () => {
  useEffect(() => {
    // Fetch live account data from the backend on mount
    useBrokerStore.getState().fetchLiveAccountData();

    wsManager.connect();
    wsManager.subscribe('ticker:BTC/USDT');
    wsManager.subscribe('depth:BTC/USDT');

    // Wire live ticker ticks to marketStore
    const handleTicker = (data: any) => {
      const price = parseFloat(data.price) || 0;
      const prevPrice = useMarketStore.getState().ticker?.currentPrice ?? price;
      const direction: 'up' | 'down' | 'flat' = price > prevPrice ? 'up' : price < prevPrice ? 'down' : 'flat';

      useMarketStore.getState().updateTicker({
        symbol: data.symbol || 'BTC/USDT',
        currentPrice: price,
        priceDirection: direction,
        change24h: parseFloat(data.change) * 100 || 0,
        changePercent24h: parseFloat(data.change) || 0,
        high24h: parseFloat(data.high) || 0,
        low24h: parseFloat(data.low) || 0,
        volume24h: parseFloat(data.volume) || 0,
        quoteVolume24h: 0,
        lastTradeTime: Date.now(),
      });
    };

    // Wire depth updates to orderbookStore
    const handleDepth = (data: any) => {
      if (data.bids && data.asks) {
        const bidsParsed: [number, number][] = data.bids.map((b: any) => [parseFloat(b[0]), parseFloat(b[1])]);
        const asksParsed: [number, number][] = data.asks.map((a: any) => [parseFloat(a[0]), parseFloat(a[1])]);
        useOrderbookStore.getState().applyDelta(bidsParsed, asksParsed, data.updateId || Date.now());
      }
    };

    wsManager.on('TICKER', handleTicker);
    wsManager.on('DEPTH_DELTA', handleDepth);

    return () => {
      wsManager.off('TICKER', handleTicker);
      wsManager.off('DEPTH_DELTA', handleDepth);
      wsManager.disconnect();
    };
  }, []);

  return (
    <div className="dark bg-[#0B0E14] text-white h-full w-full overflow-hidden">
      <TradingLayout />
    </div>
  );
};

export default TradingApp;
