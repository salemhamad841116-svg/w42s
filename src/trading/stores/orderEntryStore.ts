import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { OrderSide, OrderType, TradingMode } from '../types';
import { useBrokerStore } from './brokerStore';

interface OrderEntryState {
  tradingMode: TradingMode;
  orderType: OrderType;
  side: OrderSide;
  price: string;
  amount: string;
  quoteAmount: string;
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  postOnly: boolean;
  reduceOnly: boolean;
  triggerPrice: string;
  tpEnabled: boolean;
  tpPrice: string;
  tpMode: 'MARKET' | 'LIMIT';
  slEnabled: boolean;
  slPrice: string;
  slMode: 'MARKET' | 'LIMIT';
  isSubmitting: boolean;
  lastError: string | null;
}

interface OrderEntryActions {
  setTradingMode: (mode: TradingMode) => void;
  setOrderType: (type: OrderType) => void;
  setSide: (side: OrderSide) => void;
  setPrice: (price: string) => void;
  setAmount: (amount: string) => void;
  setQuoteAmount: (quoteAmount: string) => void;
  calculatePercentage: (pct: number) => void;
  setTimeInForce: (tif: 'GTC' | 'IOC' | 'FOK') => void;
  setPostOnly: (postOnly: boolean) => void;
  setTpSl: (type: 'tp' | 'sl', enabled: boolean, price?: string, mode?: 'MARKET' | 'LIMIT') => void;
  setTriggerPrice: (price: string) => void;
  fillFromOrderbook: (price: number, amount?: number) => void;
  fillFromChart: (price: number) => void;
  resetForm: () => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setLastError: (error: string | null) => void;
}

type OrderEntryStore = OrderEntryState & OrderEntryActions;

const initialState: OrderEntryState = {
  tradingMode: 'SPOT',
  orderType: 'LIMIT',
  side: 'BUY',
  price: '67285.50',
  amount: '0.01',
  quoteAmount: '672.85',
  timeInForce: 'GTC',
  postOnly: false,
  reduceOnly: false,
  triggerPrice: '',
  tpEnabled: false,
  tpPrice: '',
  tpMode: 'MARKET',
  slEnabled: false,
  slPrice: '',
  slMode: 'MARKET',
  isSubmitting: false,
  lastError: null,
};

export const useOrderEntryStore = create<OrderEntryStore>()(
  immer((set, get) => ({
    ...initialState,

    setTradingMode: (mode) => set((s) => { s.tradingMode = mode; }),
    setOrderType: (type) => set((s) => { s.orderType = type; }),
    setSide: (side) => set((s) => { s.side = side; }),
    setPrice: (price) =>
      set((s) => {
        s.price = price;
        const p = parseFloat(price) || 0;
        const a = parseFloat(s.amount) || 0;
        s.quoteAmount = (p * a).toFixed(2);
      }),
    setAmount: (amount) =>
      set((s) => {
        s.amount = amount;
        const p = parseFloat(s.price) || 0;
        const a = parseFloat(amount) || 0;
        s.quoteAmount = (p * a).toFixed(2);
      }),
    setQuoteAmount: (quoteAmount) =>
      set((s) => {
        s.quoteAmount = quoteAmount;
        const p = parseFloat(s.price) || 0;
        const q = parseFloat(quoteAmount) || 0;
        if (p > 0) s.amount = (q / p).toFixed(4);
      }),
    calculatePercentage: (pct) =>
      set((s) => {
        // Read live balance from the broker store based on active broker
        const brokerState = useBrokerStore.getState();
        const activeBroker = brokerState.activeBroker;
        let total = 0;
        if (activeBroker === 'MT5_LIVE' || activeBroker === 'MT5_DEMO') {
          total = brokerState.mt5Account.freeMargin || 0;
        } else {
          total = brokerState.binanceAccount.availableUSDT || 0;
        }
        const targetValue = (total * pct) / 100;
        const p = parseFloat(s.price) || 1;
        s.amount = (targetValue / p).toFixed(4);
        s.quoteAmount = targetValue.toFixed(2);
      }),
    setTimeInForce: (tif) => set((s) => { s.timeInForce = tif; }),
    setPostOnly: (postOnly) => set((s) => { s.postOnly = postOnly; }),
    setTpSl: (type, enabled, price, mode) =>
      set((s) => {
        if (type === 'tp') {
          s.tpEnabled = enabled;
          if (price !== undefined) s.tpPrice = price;
          if (mode !== undefined) s.tpMode = mode;
        } else {
          s.slEnabled = enabled;
          if (price !== undefined) s.slPrice = price;
          if (mode !== undefined) s.slMode = mode;
        }
      }),
    setTriggerPrice: (price) => set((s) => { s.triggerPrice = price; }),
    fillFromOrderbook: (price, amount) =>
      set((s) => {
        s.price = price.toFixed(2);
        if (amount) s.amount = amount.toFixed(4);
        const p = price;
        const a = parseFloat(s.amount) || 0;
        s.quoteAmount = (p * a).toFixed(2);
      }),
    fillFromChart: (price) =>
      set((s) => {
        s.price = price.toFixed(2);
        const p = price;
        const a = parseFloat(s.amount) || 0;
        s.quoteAmount = (p * a).toFixed(2);
      }),
    resetForm: () => set((s) => Object.assign(s, initialState)),
    setIsSubmitting: (isSubmitting) => set((s) => { s.isSubmitting = isSubmitting; }),
    setLastError: (error) => set((s) => { s.lastError = error; }),
  }))
);

export const selectOrderValue = (state: OrderEntryState): number => {
  const p = parseFloat(state.price) || 0;
  const a = parseFloat(state.amount) || 0;
  return p * a;
};

export const selectEstimatedFee = (state: OrderEntryState): number => {
  return selectOrderValue(state) * 0.0005;
};

export const selectEstimatedLiquidation = (state: OrderEntryState): number | null => {
  const p = parseFloat(state.price) || 0;
  if (!p) return null;
  return state.side === 'BUY' ? p * 0.9 : p * 1.1;
};