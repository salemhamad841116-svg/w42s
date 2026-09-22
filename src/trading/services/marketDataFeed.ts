import { KlineUpdate } from './types';

export const marketDataFeed = {
  generateMockBars(symbol: string, resolution: string, count: number): KlineUpdate[] {
    const bars: KlineUpdate[] = [];
    let currentTime = Date.now() - count * 60000;
    let lastClose = 65000;

    for (let i = 0; i < count; i++) {
      const open = lastClose;
      const high = open + Math.random() * 100;
      const low = open - Math.random() * 100;
      const close = low + Math.random() * (high - low);
      
      bars.push({
        symbol,
        interval: resolution,
        open: open.toFixed(2),
        high: high.toFixed(2),
        low: low.toFixed(2),
        close: close.toFixed(2),
        volume: (Math.random() * 10).toFixed(3),
        time: currentTime,
      });

      lastClose = close;
      currentTime += 60000; // 1 min per bar in this mock
    }
    return bars;
  },

  subscribeToRealtimeBar(symbol: string, resolution: string, callback: (bar: KlineUpdate) => void): () => void {
    let lastClose = 65000;
    const interval = setInterval(() => {
      const open = lastClose;
      const high = open + Math.random() * 20;
      const low = open - Math.random() * 20;
      const close = low + Math.random() * (high - low);
      
      callback({
        symbol,
        interval: resolution,
        open: open.toFixed(2),
        high: Math.max(open, close, high).toFixed(2),
        low: Math.min(open, close, low).toFixed(2),
        close: close.toFixed(2),
        volume: (Math.random() * 2).toFixed(3),
        time: Date.now(),
      });
      lastClose = close;
    }, 1000);

    return () => clearInterval(interval);
  }
};
