import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { TickerData } from '../types';

interface MarketState {
  currentSymbol: string;
  ticker: TickerData | null;
  updateTicker: (data: Partial<TickerData>) => void;
  setCurrentSymbol: (symbol: string) => void;
}

export const useMarketStore = create<MarketState>()(
  immer((set) => ({
    currentSymbol: 'BTC/USDT',
    ticker: {
      symbol: 'BTC/USDT',
      currentPrice: 0,
      priceDirection: 'flat',
      change24h: 0,
      changePercent24h: 0,
      high24h: 0,
      low24h: 0,
      volume24h: 0,
      quoteVolume24h: 0,
      lastTradeTime: Date.now(),
    },
    updateTicker: (data) =>
      set((state) => {
        if (state.ticker) {
          Object.assign(state.ticker, data);
        } else {
          state.ticker = data as TickerData;
        }
      }),
    setCurrentSymbol: (symbol) =>
      set((state) => {
        state.currentSymbol = symbol;
      }),
  }))
);

export const useCurrentPrice = () => useMarketStore((state) => state.ticker?.currentPrice ?? 0);
export const useCurrentSymbol = () => useMarketStore((state) => state.currentSymbol);
export const useTicker24h = () => useMarketStore((state) => state.ticker);