export type WSConnectionState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

export type TickerUpdate = {
  symbol: string;
  price: string;
  volume: string;
  change: string;
  high: string;
  low: string;
};

export type DepthEntry = [string, string]; // [price, size]

export type DepthSnapshot = {
  symbol: string;
  bids: DepthEntry[];
  asks: DepthEntry[];
  lastUpdateId: number;
};

export type DepthDelta = {
  symbol: string;
  bids: DepthEntry[];
  asks: DepthEntry[];
  updateId: number;
};

export type KlineUpdate = {
  symbol: string;
  interval: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  time: number;
};

export type OrderUpdate = {
  orderId: string;
  status: 'NEW' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELED' | 'REJECTED';
  filledAmount: string;
  averagePrice?: string;
};

export type PositionUpdate = {
  symbol: string;
  size: string;
  entryPrice: string;
  markPrice: string;
  unrealizedPnl: string;
};

export type BalanceUpdate = {
  asset: string;
  available: string;
  locked: string;
};

export type WSMessage =
  | { type: 'TICKER'; data: TickerUpdate }
  | { type: 'DEPTH_SNAPSHOT'; data: DepthSnapshot }
  | { type: 'DEPTH_DELTA'; data: DepthDelta }
  | { type: 'KLINE'; data: KlineUpdate }
  | { type: 'ORDER_UPDATE'; data: OrderUpdate }
  | { type: 'POSITION_UPDATE'; data: PositionUpdate }
  | { type: 'BALANCE_UPDATE'; data: BalanceUpdate }
  | { type: 'PONG' }
  | { type: 'AUTH_SUCCESS' };
