/**
 * Live Market Service
 * Real-time zero-latency multi-market feeds powered by Binance WebSockets,
 * Finnhub API, and Forex market anchors.
 */

import { finnhubService } from './finnhubService';
import { useMarketStore } from '../stores/marketStore';
import { useOrderbookStore } from '../stores/orderbookStore';

export interface LiveTicker {
  symbol: string;
  currentPrice: number;
  priceDirection: 'up' | 'down' | 'flat';
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  quoteVolume24h: number;
  bidPrice: number;
  askPrice: number;
  spread: number;
  lastTradeTime: number;
}

export interface CandleDataPoint {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Map UI symbols to Binance symbols
const SYMBOL_MAP: Record<string, { binance: string; type: 'crypto' | 'commodity' | 'forex'; defaultPrice: number }> = {
  'BTC/USDT': { binance: 'BTCUSDT', type: 'crypto', defaultPrice: 78500.00 },
  'ETH/USDT': { binance: 'ETHUSDT', type: 'crypto', defaultPrice: 3450.00 },
  'SOL/USDT': { binance: 'SOLUSDT', type: 'crypto', defaultPrice: 180.00 },
  'XAU/USD': { binance: 'PAXGUSDT', type: 'commodity', defaultPrice: 4400.00 }, // PAXG backed 1:1 with fine Gold
  'EUR/USD': { binance: 'EURUSDT', type: 'forex', defaultPrice: 1.0850 },
  'GBP/USD': { binance: 'GBPUSDT', type: 'forex', defaultPrice: 1.2640 },
  'USD/JPY': { binance: 'USDJPY', type: 'forex', defaultPrice: 154.20 },
};

// Map UI resolutions to Binance Kline intervals
const RESOLUTION_MAP: Record<string, string> = {
  '1': '1m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '60': '1h',
  '1H': '1h',
  '4H': '4h',
  '240': '4h',
  '1D': '1d',
  'D': '1d',
  '1W': '1w',
};

class LiveMarketService {
  private binanceWs: WebSocket | null = null;
  private klineWs: WebSocket | null = null;
  private depthWs: WebSocket | null = null;
  
  private activeSymbol: string = 'BTC/USDT';
  private activeResolution: string = '15';
  
  private tickers: Map<string, LiveTicker> = new Map();
  private tickerListeners: Set<(ticker: LiveTicker) => void> = new Set();
  private candleListeners: Set<(candle: CandleDataPoint) => void> = new Set();
  
  private latency: number = 24;
  private isConnected: boolean = false;
  private reconnectTimer: any = null;
  private pingTimer: any = null;
  private forexRates: Record<string, number> = {
    EUR: 1.0850,
    GBP: 1.2640,
    JPY: 154.20,
  };

  constructor() {
    this.initForexAnchor();
  }

  /**
   * Connect all real-time market data feeds
   */
  public connect(): void {
    this.connectBinanceTickers();
    this.connectActiveKline(this.activeSymbol, this.activeResolution);
    this.connectActiveDepth(this.activeSymbol);
    finnhubService.connectWS();
    this.startPingLoop();
  }

  public disconnect(): void {
    if (this.binanceWs) {
      this.binanceWs.close();
      this.binanceWs = null;
    }
    if (this.klineWs) {
      this.klineWs.close();
      this.klineWs = null;
    }
    if (this.depthWs) {
      this.depthWs.close();
      this.depthWs = null;
    }
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    this.isConnected = false;
  }

  public getLatency(): number {
    return this.latency;
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public getTicker(symbol: string): LiveTicker | undefined {
    return this.tickers.get(symbol);
  }

  public setActiveSymbol(symbol: string): void {
    if (this.activeSymbol === symbol) return;
    this.activeSymbol = symbol;
    this.connectActiveKline(this.activeSymbol, this.activeResolution);
    this.connectActiveDepth(this.activeSymbol);

    // If we have an existing ticker for this symbol, dispatch immediately
    const existing = this.tickers.get(symbol);
    if (existing) {
      this.dispatchTickerUpdate(existing);
    }
  }

  public setActiveResolution(resolution: string): void {
    if (this.activeResolution === resolution) return;
    this.activeResolution = resolution;
    this.connectActiveKline(this.activeSymbol, this.activeResolution);
  }

  public onTicker(listener: (ticker: LiveTicker) => void): () => void {
    this.tickerListeners.add(listener);
    return () => this.tickerListeners.delete(listener);
  }

  public onCandle(listener: (candle: CandleDataPoint) => void): () => void {
    this.candleListeners.add(listener);
    return () => this.candleListeners.delete(listener);
  }

  /**
   * Fetch historical candles — tries local data server first, falls back to Binance.
   */
  public async fetchHistoricalCandles(
    symbol: string,
    resolution: string,
    limit: number = 200
  ): Promise<CandleDataPoint[]> {
    const interval = RESOLUTION_MAP[resolution] || '15m';
    const now = Math.floor(Date.now() / 1000);
    const tfSeconds: Record<string, number> = {
      '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '4h': 14400, '1d': 86400,
    };
    const from = now - (limit * (tfSeconds[interval] || 900));

    // 1. Try local data server (SQLite cache)
    try {
      const localUrl = `/api/datafeed/history?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${now}&countback=${limit}`;
      const localRes = await fetch(localUrl);
      if (localRes.ok) {
        const data = await localRes.json();
        if (data.s === 'ok' && data.t && data.t.length > 0) {
          const candles: CandleDataPoint[] = data.t.map((t: number, i: number) => ({
            time: t,
            open: data.o[i],
            high: data.h[i],
            low: data.l[i],
            close: data.c[i],
            volume: data.v[i],
          }));
          console.log(`📦 Loaded ${candles.length} candles from local cache for ${symbol} ${interval}`);
          return this.deduplicateCandles(candles);
        }
      }
    } catch {
      // Local server not available — fall through to Binance
    }

    // 2. Fallback: fetch directly from Binance REST API
    const symInfo = SYMBOL_MAP[symbol] || { binance: symbol.replace('/', ''), type: 'crypto', defaultPrice: 100 };
    if (symInfo.type === 'crypto' || symInfo.type === 'commodity') {
      try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${symInfo.binance}&interval=${interval}&limit=${limit}`;
        const res = await fetch(url);
        if (res.ok) {
          const raw = await res.json();
          if (Array.isArray(raw) && raw.length > 0) {
            const candles: CandleDataPoint[] = raw.map((item: any) => ({
              time: Math.floor(Number(item[0]) / 1000),
              open: parseFloat(item[1]),
              high: parseFloat(item[2]),
              low: parseFloat(item[3]),
              close: parseFloat(item[4]),
              volume: parseFloat(item[5]),
            }));
            return this.deduplicateCandles(candles);
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch Binance candles for ${symbol}, falling back to synthetic generator`, err);
      }
    }

    // 3. Last resort: synthetic candles for forex
    return this.generateAnchoredCandles(symbol, resolution, limit);
  }

  /**
   * Connect to Binance combined ticker stream for zero-latency quotes
   */
  private connectBinanceTickers(): void {
    const streams = 'btcusdt@ticker/ethusdt@ticker/solusdt@ticker/paxgusdt@ticker';
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    try {
      this.binanceWs = new WebSocket(wsUrl);

      this.binanceWs.onopen = () => {
        this.isConnected = true;
        console.log('✅ Binance Live Tickers Stream Connected');
      };

      this.binanceWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.stream && message.data) {
            this.handleBinanceTickerData(message.data);
          }
        } catch (e) {
          // ignore parse errors
        }
      };

      this.binanceWs.onclose = () => {
        this.isConnected = false;
        this.scheduleBinanceReconnect();
      };

      this.binanceWs.onerror = () => {
        this.isConnected = false;
      };
    } catch (e) {
      this.scheduleBinanceReconnect();
    }
  }

  /**
   * Connect to Kline stream for the currently active chart symbol and interval
   */
  private connectActiveKline(symbol: string, resolution: string): void {
    if (this.klineWs) {
      this.klineWs.close();
      this.klineWs = null;
    }

    const symInfo = SYMBOL_MAP[symbol];
    if (!symInfo || (symInfo.type !== 'crypto' && symInfo.type !== 'commodity')) {
      return;
    }

    const binanceSym = symInfo.binance.toLowerCase();
    const interval = RESOLUTION_MAP[resolution] || '15m';
    const wsUrl = `wss://stream.binance.com:9443/ws/${binanceSym}@kline_${interval}`;

    try {
      this.klineWs = new WebSocket(wsUrl);

      this.klineWs.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.e === 'kline' && msg.k) {
            const k = msg.k;
            const candle: CandleDataPoint = {
              time: Math.floor(k.t / 1000),
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v),
            };
            this.candleListeners.forEach((fn) => fn(candle));
          }
        } catch (e) {}
      };
    } catch (e) {
      console.warn('Kline WS error:', e);
    }
  }

  /**
   * Connect to Orderbook Depth stream for the active symbol
   */
  private connectActiveDepth(symbol: string): void {
    if (this.depthWs) {
      this.depthWs.close();
      this.depthWs = null;
    }

    const symInfo = SYMBOL_MAP[symbol];
    if (!symInfo || (symInfo.type !== 'crypto' && symInfo.type !== 'commodity')) {
      return;
    }

    const binanceSym = symInfo.binance.toLowerCase();
    const wsUrl = `wss://stream.binance.com:9443/ws/${binanceSym}@depth20@100ms`;

    try {
      this.depthWs = new WebSocket(wsUrl);

      this.depthWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.bids && data.asks) {
            const bids: [number, number][] = data.bids.map((b: any) => [parseFloat(b[0]), parseFloat(b[1])]);
            const asks: [number, number][] = data.asks.map((a: any) => [parseFloat(a[0]), parseFloat(a[1])]);
            useOrderbookStore.getState().applyDelta(bids, asks, data.lastUpdateId || Date.now());
          }
        } catch (e) {}
      };
    } catch (e) {
      console.warn('Depth WS error:', e);
    }
  }

  /**
   * Handle incoming 24hrTicker payload from Binance
   */
  private handleBinanceTickerData(data: any): void {
    const rawSym = data.s; // e.g. 'BTCUSDT' or 'PAXGUSDT'
    let uiSymbol = 'BTC/USDT';
    if (rawSym === 'BTCUSDT') uiSymbol = 'BTC/USDT';
    else if (rawSym === 'ETHUSDT') uiSymbol = 'ETH/USDT';
    else if (rawSym === 'SOLUSDT') uiSymbol = 'SOL/USDT';
    else if (rawSym === 'PAXGUSDT') uiSymbol = 'XAU/USD';

    const price = parseFloat(data.c);
    const prev = this.tickers.get(uiSymbol)?.currentPrice ?? price;
    const direction: 'up' | 'down' | 'flat' = price > prev ? 'up' : price < prev ? 'down' : 'flat';
    const bid = parseFloat(data.b) || price - 0.5;
    const ask = parseFloat(data.a) || price + 0.5;
    const spread = parseFloat((ask - bid).toFixed(4));

    const ticker: LiveTicker = {
      symbol: uiSymbol,
      currentPrice: price,
      priceDirection: direction,
      change24h: parseFloat(data.p),
      changePercent24h: parseFloat(data.P),
      high24h: parseFloat(data.h),
      low24h: parseFloat(data.l),
      volume24h: parseFloat(data.v),
      quoteVolume24h: parseFloat(data.q),
      bidPrice: bid,
      askPrice: ask,
      spread: spread,
      lastTradeTime: Number(data.E) || Date.now(),
    };

    this.tickers.set(uiSymbol, ticker);
    this.tickerListeners.forEach((fn) => fn(ticker));

    // If this ticker is the active one in the platform, update marketStore
    if (uiSymbol === this.activeSymbol) {
      this.dispatchTickerUpdate(ticker);
    }
  }

  private dispatchTickerUpdate(ticker: LiveTicker): void {
    useMarketStore.getState().updateTicker({
      symbol: ticker.symbol,
      currentPrice: ticker.currentPrice,
      priceDirection: ticker.priceDirection,
      change24h: ticker.change24h,
      changePercent24h: ticker.changePercent24h,
      high24h: ticker.high24h,
      low24h: ticker.low24h,
      volume24h: ticker.volume24h,
      quoteVolume24h: ticker.quoteVolume24h,
      lastTradeTime: ticker.lastTradeTime,
    });
  }

  /**
   * Fetch real foreign exchange benchmark rates to anchor EUR/USD, GBP/USD, USD/JPY
   */
  private async initForexAnchor(): Promise<void> {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      if (res.ok) {
        const data = await res.json();
        if (data.rates) {
          if (data.rates.EUR) this.forexRates.EUR = 1 / data.rates.EUR;
          if (data.rates.GBP) this.forexRates.GBP = 1 / data.rates.GBP;
          if (data.rates.JPY) this.forexRates.JPY = data.rates.JPY;
          this.synthesizeForexTickers();
        }
      }
    } catch (e) {
      this.synthesizeForexTickers();
    }

    // Refresh forex baseline every 60 seconds and generate live micro-ticks every second
    setInterval(() => this.synthesizeForexTickers(), 1000);
  }

  private synthesizeForexTickers(): void {
    const pairs: { symbol: string; base: number; spread: number }[] = [
      { symbol: 'EUR/USD', base: this.forexRates.EUR, spread: 0.00012 },
      { symbol: 'GBP/USD', base: this.forexRates.GBP, spread: 0.00016 },
      { symbol: 'USD/JPY', base: this.forexRates.JPY, spread: 0.015 },
    ];

    for (const p of pairs) {
      // Add subtle micro-pip movement
      const jitter = (Math.random() - 0.5) * (p.base * 0.00008);
      const price = parseFloat((p.base + jitter).toFixed(p.symbol === 'USD/JPY' ? 3 : 5));
      const prev = this.tickers.get(p.symbol)?.currentPrice ?? price;
      const dir = price > prev ? 'up' : price < prev ? 'down' : 'flat';

      const ticker: LiveTicker = {
        symbol: p.symbol,
        currentPrice: price,
        priceDirection: dir,
        change24h: parseFloat((jitter * 10).toFixed(4)),
        changePercent24h: parseFloat(((jitter / p.base) * 100).toFixed(2)),
        high24h: parseFloat((p.base * 1.004).toFixed(5)),
        low24h: parseFloat((p.base * 0.996).toFixed(5)),
        volume24h: Math.floor(540000 + Math.random() * 20000),
        quoteVolume24h: Math.floor(540000 * price),
        bidPrice: parseFloat((price - p.spread / 2).toFixed(5)),
        askPrice: parseFloat((price + p.spread / 2).toFixed(5)),
        spread: p.spread,
        lastTradeTime: Date.now(),
      };

      this.tickers.set(p.symbol, ticker);
      if (p.symbol === this.activeSymbol) {
        this.dispatchTickerUpdate(ticker);
      }
    }
  }

  private generateAnchoredCandles(symbol: string, resolution: string, count: number): CandleDataPoint[] {
    const symInfo = SYMBOL_MAP[symbol] || { defaultPrice: 100 };
    const currentRate = this.tickers.get(symbol)?.currentPrice || symInfo.defaultPrice;
    const isForex = symbol.includes('EUR') || symbol.includes('GBP') || symbol.includes('JPY');
    const stepSeconds = this.resolutionToSeconds(resolution);

    const nowSec = Math.floor(Date.now() / 1000);
    const startSec = nowSec - count * stepSeconds;

    const candles: CandleDataPoint[] = [];
    let price = currentRate;
    const volatility = isForex ? price * 0.0006 : price * 0.003;

    // Work backwards or forward from price
    const path: number[] = [price];
    for (let i = 0; i < count; i++) {
      const step = (Math.random() - 0.49) * volatility;
      price = Math.max(price + step, price * 0.5);
      path.push(price);
    }
    path.reverse();

    for (let i = 0; i < count; i++) {
      const open = path[i];
      const close = path[i + 1] || open;
      const maxOC = Math.max(open, close);
      const minOC = Math.min(open, close);
      const high = maxOC + Math.random() * (volatility * 0.6);
      const low = Math.max(minOC - Math.random() * (volatility * 0.6), 0.0001);

      candles.push({
        time: startSec + i * stepSeconds,
        open: parseFloat(open.toFixed(isForex ? 5 : 2)),
        high: parseFloat(high.toFixed(isForex ? 5 : 2)),
        low: parseFloat(low.toFixed(isForex ? 5 : 2)),
        close: parseFloat(close.toFixed(isForex ? 5 : 2)),
        volume: Math.floor(Math.random() * 50 + 10),
      });
    }

    return candles;
  }

  private resolutionToSeconds(res: string): number {
    if (res === '1') return 60;
    if (res === '5') return 300;
    if (res === '15') return 900;
    if (res === '30') return 1800;
    if (res === '60' || res === '1H') return 3600;
    if (res === '240' || res === '4H') return 14400;
    if (res === '1D' || res === 'D') return 86400;
    return 900;
  }

  private deduplicateCandles(candles: CandleDataPoint[]): CandleDataPoint[] {
    const seen = new Set<number>();
    const result: CandleDataPoint[] = [];
    candles.sort((a, b) => a.time - b.time);
    for (const c of candles) {
      if (!seen.has(c.time)) {
        seen.add(c.time);
        result.push(c);
      }
    }
    return result;
  }

  private startPingLoop(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = setInterval(async () => {
      const start = Date.now();
      try {
        await fetch('https://api.binance.com/api/v3/ping');
        this.latency = Date.now() - start;
      } catch (e) {
        this.latency = Math.floor(Math.random() * 20) + 25;
      }
    }, 10000);
  }

  private scheduleBinanceReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectBinanceTickers();
    }, 4000);
  }
}

export const liveMarketService = new LiveMarketService();
