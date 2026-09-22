import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { PriceLevel } from '../types';
import Decimal from 'decimal.js';

type ViewMode = 'both' | 'bids' | 'asks';

interface OrderbookState {
  bids: PriceLevel[];
  asks: PriceLevel[];
  bestBid: number;
  bestAsk: number;
  spread: number;
  spreadPercent: number;
  lastUpdateId: number;
  tickSize: number;
  viewMode: ViewMode;
}

interface OrderbookActions {
  applySnapshot: (bids: PriceLevel[], asks: PriceLevel[], lastUpdateId: number) => void;
  applyDelta: (bids: [number, number][], asks: [number, number][], lastUpdateId: number) => void;
  setTickSize: (tickSize: number) => void;
  setViewMode: (mode: ViewMode) => void;
  aggregateByTick: () => void;
}

type OrderbookStore = OrderbookState & OrderbookActions;

const basePrice = 67285.5;
let currentBidTotal = 0;
const INITIAL_BIDS: PriceLevel[] = Array.from({ length: 30 }).map((_, i) => {
  const amount = Number((0.2 + (i % 5) * 0.35).toFixed(4));
  currentBidTotal += amount;
  return {
    price: Number((basePrice - (i + 1) * 0.5).toFixed(2)),
    amount,
    total: Number(currentBidTotal.toFixed(4)),
  };
});

let currentAskTotal = 0;
const INITIAL_ASKS: PriceLevel[] = Array.from({ length: 30 }).map((_, i) => {
  const amount = Number((0.2 + (i % 5) * 0.35).toFixed(4));
  currentAskTotal += amount;
  return {
    price: Number((basePrice + (i + 1) * 0.5).toFixed(2)),
    amount,
    total: Number(currentAskTotal.toFixed(4)),
  };
});

export const useOrderbookStore = create<OrderbookStore>()(
  immer((set, get) => ({
    bids: INITIAL_BIDS,
    asks: INITIAL_ASKS,
    bestBid: INITIAL_BIDS[0]?.price ?? 67285.0,
    bestAsk: INITIAL_ASKS[0]?.price ?? 67286.0,
    spread: 1.0,
    spreadPercent: 0.0015,
    lastUpdateId: 1,
    tickSize: 0.01,
    viewMode: 'both',

    applySnapshot: (bids, asks, lastUpdateId) =>
      set((state) => {
        if (lastUpdateId <= state.lastUpdateId) return;
        
        state.bids = [...bids].sort((a, b) => b.price - a.price); // Descending
        state.asks = [...asks].sort((a, b) => a.price - b.price); // Ascending
        state.lastUpdateId = lastUpdateId;

        if (state.bids.length > 0 && state.asks.length > 0) {
          state.bestBid = state.bids[0].price;
          state.bestAsk = state.asks[0].price;
          const spread = new Decimal(state.bestAsk).minus(state.bestBid);
          state.spread = spread.toNumber();
          state.spreadPercent = spread.div(state.bestAsk).mul(100).toNumber();
        }
      }),

    applyDelta: (bidsDeltas, asksDeltas, lastUpdateId) =>
      set((state) => {
        if (lastUpdateId <= state.lastUpdateId) return;

        // Helper to update levels
        const updateLevels = (currentLevels: PriceLevel[], deltas: [number, number][], isBid: boolean) => {
          const levelMap = new Map(currentLevels.map((l) => [l.price, l]));
          
          for (const [price, amount] of deltas) {
            if (amount === 0) {
              levelMap.delete(price);
            } else {
              levelMap.set(price, { price, amount, total: 0 });
            }
          }

          const newLevels = Array.from(levelMap.values());
          return newLevels.sort((a, b) => (isBid ? b.price - a.price : a.price - b.price));
        };

        const newBids = updateLevels(state.bids, bidsDeltas, true);
        const newAsks = updateLevels(state.asks, asksDeltas, false);

        // Recalculate totals
        let bidTotal = 0;
        state.bids = newBids.slice(0, 50).map((b) => {
          bidTotal += b.amount;
          return { ...b, total: bidTotal };
        });

        let askTotal = 0;
        state.asks = newAsks.slice(0, 50).map((a) => {
          askTotal += a.amount;
          return { ...a, total: askTotal };
        });

        state.lastUpdateId = lastUpdateId;

        if (state.bids.length > 0 && state.asks.length > 0) {
          state.bestBid = state.bids[0].price;
          state.bestAsk = state.asks[0].price;
          const spread = new Decimal(state.bestAsk).minus(state.bestBid);
          state.spread = spread.toNumber();
          state.spreadPercent = spread.div(state.bestAsk).mul(100).toNumber();
        }
      }),

    setTickSize: (tickSize) =>
      set((state) => {
        state.tickSize = tickSize;
      }),

    setViewMode: (mode) =>
      set((state) => {
        state.viewMode = mode;
      }),

    aggregateByTick: () => {},
  }))
);
