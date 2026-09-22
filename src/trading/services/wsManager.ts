import { WSConnectionState } from './types';
import { liveMarketService, LiveTicker } from './liveMarketService';

export interface IWSManager {
  connect(): void;
  disconnect(): void;
  subscribe(channel: string): void;
  unsubscribe(channel: string): void;
  authenticate(token: string): void;
  sendPing(): void;
  on(event: string, handler: (data: any) => void): void;
  off(event: string, handler: (data: any) => void): void;
}

export class LiveWSManager implements IWSManager {
  public url: string = 'wss://stream.binance.com:9443/stream + wss://ws.finnhub.io';
  public state: WSConnectionState = 'DISCONNECTED';
  public reconnectAttempts: number = 0;
  public maxReconnects: number = 10;
  public isAuthenticated: boolean = false;
  public latency: number = 24;
  
  private subscriptions: Set<string> = new Set();
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
  private unsubscribeTicker: (() => void) | null = null;
  private unsubscribeCandle: (() => void) | null = null;
  private pingInterval: any = null;

  connect(): void {
    this.state = 'CONNECTING';
    liveMarketService.connect();
    this.state = 'CONNECTED';
    this.reconnectAttempts = 0;

    // Bridge liveMarketService ticker updates to WS subscribers
    this.unsubscribeTicker = liveMarketService.onTicker((ticker: LiveTicker) => {
      this.emit('TICKER', {
        symbol: ticker.symbol,
        price: ticker.currentPrice.toString(),
        volume: ticker.volume24h.toString(),
        change: (ticker.changePercent24h / 100).toString(),
        high: ticker.high24h.toString(),
        low: ticker.low24h.toString(),
      });
    });

    // Bridge live candles
    this.unsubscribeCandle = liveMarketService.onCandle((candle) => {
      this.emit('KLINE', candle);
    });

    // Start periodic ping measurement
    this.pingInterval = setInterval(() => {
      this.sendPing();
    }, 5000);
  }

  disconnect(): void {
    this.state = 'DISCONNECTED';
    this.isAuthenticated = false;
    this.subscriptions.clear();
    if (this.unsubscribeTicker) {
      this.unsubscribeTicker();
      this.unsubscribeTicker = null;
    }
    if (this.unsubscribeCandle) {
      this.unsubscribeCandle();
      this.unsubscribeCandle = null;
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    liveMarketService.disconnect();
  }

  subscribe(channel: string): void {
    this.subscriptions.add(channel);
    if (channel.startsWith('ticker:')) {
      const sym = channel.replace('ticker:', '');
      liveMarketService.setActiveSymbol(sym);
    }
  }

  unsubscribe(channel: string): void {
    this.subscriptions.delete(channel);
  }

  authenticate(token: string): void {
    setTimeout(() => {
      this.isAuthenticated = true;
      this.emit('AUTH_SUCCESS', {});
    }, 100);
  }

  sendPing(): void {
    this.latency = liveMarketService.getLatency();
    this.emit('PONG', { latency: this.latency });
  }

  on(event: string, handler: (data: any) => void): void {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set());
    }
    this.messageHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: (data: any) => void): void {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  private emit(event: string, data: any) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.forEach((h) => h(data));
    }
  }
}

export const wsManager = new LiveWSManager();
