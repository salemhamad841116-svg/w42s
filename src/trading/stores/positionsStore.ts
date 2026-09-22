import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { PositionData, OrderData, TradeRecord, AccountBalance } from '../types';

interface PositionsState {
  positions: PositionData[];
  openOrders: OrderData[];
  orderHistory: OrderData[];
  tradeHistory: TradeRecord[];
  balances: AccountBalance[];
}

interface PositionsActions {
  setPositions: (positions: PositionData[]) => void;
  setOpenOrders: (orders: OrderData[]) => void;
  addOptimisticOrder: (order: OrderData) => void;
  reconcileOrder: (order: OrderData) => void;
  removeOrder: (orderId: string) => void;
  updatePosition: (position: PositionData) => void;
  addTradeRecord: (trade: TradeRecord) => void;
  updateBalance: (balances: AccountBalance[]) => void;
  partialClosePosition: (positionId: string, unitsToClose: number) => { success: boolean; realizedPnl: number };
}

type PositionsStore = PositionsState & PositionsActions;

const INITIAL_POSITIONS: PositionData[] = [
  {
    id: 'pos_1',
    symbol: 'BTC/USDT',
    side: 'BUY',
    size: 0.85,
    entryPrice: 65420.00,
    markPrice: 67285.50,
    liquidationPrice: 58800.00,
    margin: 5560.70,
    marginRatio: 14.2,
    leverage: 10,
    unrealizedPnl: 1585.67,
    roePct: 28.51,
    takeProfitPrice: 71500.00,
    stopLossPrice: 63800.00,
    tradingMode: 'CROSS_MARGIN',
    createdAt: Date.now() - 3600000 * 8,
    updatedAt: Date.now(),
  },
  {
    id: 'pos_2',
    symbol: 'ETH/USDT',
    side: 'SELL',
    size: 5.0,
    entryPrice: 3580.00,
    markPrice: 3420.00,
    liquidationPrice: 4120.00,
    margin: 3580.00,
    marginRatio: 18.5,
    leverage: 5,
    unrealizedPnl: 800.00,
    roePct: 22.35,
    takeProfitPrice: 3200.00,
    stopLossPrice: 3750.00,
    tradingMode: 'CROSS_MARGIN',
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now(),
  },
];

const INITIAL_ORDERS: OrderData[] = [
  {
    id: 'ord_1',
    clientOrderId: 'cl_1',
    symbol: 'BTC/USDT',
    side: 'BUY',
    type: 'LIMIT',
    price: 66100.00,
    amount: 0.50,
    filled: 0,
    status: 'NEW',
    timeInForce: 'GTC',
    postOnly: false,
    reduceOnly: false,
    createdAt: Date.now() - 1800000,
    updatedAt: Date.now() - 1800000,
  },
  {
    id: 'ord_2',
    clientOrderId: 'cl_2',
    symbol: 'BTC/USDT',
    side: 'SELL',
    type: 'LIMIT',
    price: 69500.00,
    amount: 0.85,
    filled: 0,
    status: 'NEW',
    timeInForce: 'GTC',
    postOnly: false,
    reduceOnly: false,
    createdAt: Date.now() - 900000,
    updatedAt: Date.now() - 900000,
  },
];

const INITIAL_BALANCES: AccountBalance[] = [
  { asset: 'USDT', available: 12450.80, locked: 2500.00, total: 14950.80 },
  { asset: 'BTC', available: 0.45200000, locked: 0.85000000, total: 1.30200000 },
  { asset: 'ETH', available: 3.25000000, locked: 0.00000000, total: 3.25000000 },
  { asset: 'SOL', available: 25.50000000, locked: 0.00000000, total: 25.50000000 },
];

export const usePositionsStore = create<PositionsStore>()(
  immer((set) => ({
    positions: INITIAL_POSITIONS,
    openOrders: INITIAL_ORDERS,
    orderHistory: [],
    tradeHistory: [],
    balances: INITIAL_BALANCES,

    setPositions: (positions) => set((state) => { state.positions = positions; }),
    setOpenOrders: (orders) => set((state) => { state.openOrders = orders; }),
    
    addOptimisticOrder: (order) => set((state) => {
      state.openOrders.unshift(order);
    }),
    
    reconcileOrder: (order) => set((state) => {
      const idx = state.openOrders.findIndex(o => o.id === order.id || o.clientOrderId === order.clientOrderId);
      if (idx !== -1) {
        if (order.status === 'FILLED' || order.status === 'CANCELLED' || order.status === 'REJECTED') {
          state.openOrders.splice(idx, 1);
          state.orderHistory.unshift(order);
        } else {
          state.openOrders[idx] = order;
        }
      } else if (order.status !== 'FILLED' && order.status !== 'CANCELLED' && order.status !== 'REJECTED') {
        state.openOrders.unshift(order);
      } else {
        state.orderHistory.unshift(order);
      }
    }),
    
    removeOrder: (orderId) => set((state) => {
      const order = state.openOrders.find(o => o.id === orderId);
      state.openOrders = state.openOrders.filter(o => o.id !== orderId);
      if (order) {
        state.orderHistory.unshift({ ...order, status: 'CANCELLED', updatedAt: Date.now() });
      }
    }),
    
    updatePosition: (position) => set((state) => {
      const idx = state.positions.findIndex(p => p.id === position.id);
      if (idx !== -1) {
        state.positions[idx] = position;
      } else {
        state.positions.push(position);
      }
    }),
    
    addTradeRecord: (trade) => set((state) => {
      state.tradeHistory.unshift(trade);
    }),
    
    updateBalance: (balances) => set((state) => {
      state.balances = balances;
    }),

    partialClosePosition: (positionId: string, unitsToClose: number) => {
      let realized = 0;
      set((state) => {
        const idx = state.positions.findIndex(p => p.id === positionId);
        if (idx === -1) return;
        const pos = state.positions[idx];
        const isLong = pos.side === 'BUY' || String(pos.side).toUpperCase() === 'LONG';
        const closeAmount = Math.min(unitsToClose, pos.size);
        const priceDiff = isLong ? (pos.markPrice - pos.entryPrice) : (pos.entryPrice - pos.markPrice);
        realized = priceDiff * closeAmount;

        // Record trade in tradeHistory
        state.tradeHistory.unshift({
          id: `trade_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          orderId: `ord_close_${Date.now()}`,
          symbol: pos.symbol,
          side: isLong ? 'SELL' : 'BUY',
          price: pos.markPrice,
          amount: closeAmount,
          fee: closeAmount * pos.markPrice * 0.0004,
          realizedPnl: realized,
          timestamp: Date.now(),
        });

        // Update available balance
        const usdtBal = state.balances.find(b => b.asset === 'USDT');
        if (usdtBal) {
          usdtBal.available += realized;
          usdtBal.total += realized;
        }

        if (closeAmount >= pos.size - 0.000001) {
          // Complete position close
          state.positions.splice(idx, 1);
        } else {
          // Partial close: reduce size and proportional margin
          const ratio = (pos.size - closeAmount) / pos.size;
          pos.size = +(pos.size - closeAmount).toFixed(4);
          pos.margin = +(pos.margin * ratio).toFixed(2);
          pos.unrealizedPnl = +(pos.unrealizedPnl * ratio).toFixed(2);
          pos.updatedAt = Date.now();
        }
      });
      return { success: true, realizedPnl: realized };
    },
  }))
);
