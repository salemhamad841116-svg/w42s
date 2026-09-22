/**
 * Finnhub Market Data & News Service
 * Real-time quotes, news, and WebSocket trades powered by Finnhub API
 */

export interface FinnhubQuote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface FinnhubNewsItem {
  id: number;
  category: string;
  datetime: number;
  headline: string;
  summary: string;
  url: string;
  source: string;
  image?: string;
  related?: string;
}

export interface FinnhubTrade {
  s: string; // Symbol
  p: number; // Price
  t: number; // Timestamp
  v: number; // Volume
}

class FinnhubService {
  private apiKey: string = (import.meta as any).env?.VITE_FINNHUB_API_KEY || 'dag1pv1r01quf8msacigdag1pv1r01quf8msacj0';
  private ws: WebSocket | null = null;
  private subscribers: Map<string, Set<(trade: FinnhubTrade) => void>> = new Map();
  private isConnecting: boolean = false;
  private reconnectTimer: any = null;
  private activeSubscriptions: Set<string> = new Set();

  public getApiKey(): string {
    return this.apiKey;
  }

  public setApiKey(key: string) {
    this.apiKey = key;
  }

  /**
   * Fetch real-time quote for a given symbol
   */
  public async getQuote(symbol: string): Promise<FinnhubQuote | null> {
    try {
      const formattedSymbol = this.formatSymbolForFinnhub(symbol);
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(formattedSymbol)}&token=${this.apiKey}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`Finnhub quote fetch failed for ${symbol}: ${res.statusText}`);
        return null;
      }
      const data: FinnhubQuote = await res.json();
      if (data && typeof data.c === 'number' && data.c > 0) {
        return data;
      }
      return null;
    } catch (err) {
      console.error(`Finnhub getQuote error (${symbol}):`, err);
      return null;
    }
  }

  /**
   * Fetch real-time market and financial news
   */
  public async getMarketNews(category: string = 'general'): Promise<FinnhubNewsItem[]> {
    try {
      const url = `https://finnhub.io/api/v1/news?category=${encodeURIComponent(category)}&token=${this.apiKey}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`Finnhub news fetch failed: ${res.statusText}`);
        return [];
      }
      const items: FinnhubNewsItem[] = await res.json();
      if (Array.isArray(items)) {
        return items.slice(0, 30);
      }
      return [];
    } catch (err) {
      console.error('Finnhub getMarketNews error:', err);
      return [];
    }
  }

  /**
   * Connect to Finnhub WebSocket stream
   */
  public connectWS(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.ws = new WebSocket(`wss://ws.finnhub.io?token=${this.apiKey}`);

      this.ws.onopen = () => {
        this.isConnecting = false;
        console.log('✅ Finnhub WebSocket Connected');
        // Resubscribe to active symbols
        this.activeSubscriptions.forEach((sym) => {
          this.sendSubscribe(sym);
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'trade' && Array.isArray(payload.data)) {
            for (const trade of payload.data) {
              const handlers = this.subscribers.get(trade.s);
              if (handlers) {
                handlers.forEach((fn) => fn(trade));
              }
            }
          }
        } catch (e) {
          // Ignore non-json ping/pongs
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        this.isConnecting = false;
        console.warn('Finnhub WS error:', err);
      };
    } catch (err) {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Subscribe to trades for a symbol
   */
  public subscribeTrades(symbol: string, callback: (trade: FinnhubTrade) => void): () => void {
    const finnhubSymbol = this.formatSymbolForFinnhub(symbol);
    if (!this.subscribers.has(finnhubSymbol)) {
      this.subscribers.set(finnhubSymbol, new Set());
    }
    this.subscribers.get(finnhubSymbol)!.add(callback);
    this.activeSubscriptions.add(finnhubSymbol);

    this.connectWS();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendSubscribe(finnhubSymbol);
    }

    return () => {
      const handlers = this.subscribers.get(finnhubSymbol);
      if (handlers) {
        handlers.delete(callback);
        if (handlers.size === 0) {
          this.subscribers.delete(finnhubSymbol);
          this.activeSubscriptions.delete(finnhubSymbol);
          this.sendUnsubscribe(finnhubSymbol);
        }
      }
    };
  }

  private sendSubscribe(symbol: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
    }
  }

  private sendUnsubscribe(symbol: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.activeSubscriptions.size > 0) {
        this.connectWS();
      }
    }, 5000);
  }

  private formatSymbolForFinnhub(symbol: string): string {
    const clean = symbol.replace('/', '').toUpperCase();
    if (clean === 'BTCUSDT' || clean === 'BTC') return 'BINANCE:BTCUSDT';
    if (clean === 'ETHUSDT' || clean === 'ETH') return 'BINANCE:ETHUSDT';
    if (clean === 'SOLUSDT' || clean === 'SOL') return 'BINANCE:SOLUSDT';
    if (clean === 'XAUUSD' || clean === 'PAXGUSDT' || clean === 'GOLD') return 'BINANCE:PAXGUSDT';
    return `BINANCE:${clean}`;
  }
}

export const finnhubService = new FinnhubService();
