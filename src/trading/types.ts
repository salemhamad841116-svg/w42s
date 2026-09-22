export type OrderType = 'LIMIT' | 'MARKET' | 'STOP_LIMIT' | 'STOP_MARKET' | 'TRAILING_STOP' | 'OCO';
export type TimeInForce = 'GTC' | 'IOC' | 'FOK';
export type TradingMode = 'SPOT' | 'CROSS_MARGIN' | 'ISOLATED_MARGIN';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'NEW' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED' | 'EXPIRED' | 'REJECTED';
export type AssetCategory = 'crypto' | 'forex' | 'stocks' | 'indices';
export type ChartType = 'candlestick' | 'heikin_ashi' | 'line' | 'area' | 'bars';

export interface PriceLevel {
  price: number;
  amount: number;
  total: number;
  count?: number;
}

export interface TickerData {
  symbol: string;
  currentPrice: number;
  priceDirection: 'up' | 'down' | 'flat';
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  lastTradeTime?: number;
}
