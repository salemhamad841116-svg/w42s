/**
 * Web Worker for off-thread orderbook processing
 */

type OrderBookEntry = {
  price: number;
  amount: number;
  total?: number;
};

type State = {
  bids: Map<number, number>;
  asks: Map<number, number>;
  tickSize: number;
};

const state: State = {
  bids: new Map(),
  asks: new Map(),
  tickSize: 0.01,
};

let pendingUpdate = false;

const aggregateAndSort = (
  map: Map<number, number>,
  tickSize: number,
  side: 'bid' | 'ask'
): OrderBookEntry[] => {
  const aggregated = new Map<number, number>();
  
  for (const [price, amount] of map.entries()) {
    if (amount <= 0) continue; // remove empty levels
    
    // Aggregate to tick size
    const tickMultiplier = 1 / tickSize;
    let aggregatedPrice = price;
    
    if (side === 'bid') {
      aggregatedPrice = Math.floor(price * tickMultiplier) / tickMultiplier;
    } else {
      aggregatedPrice = Math.ceil(price * tickMultiplier) / tickMultiplier;
    }
    
    const existing = aggregated.get(aggregatedPrice) || 0;
    aggregated.set(aggregatedPrice, existing + amount);
  }

  const entries: OrderBookEntry[] = Array.from(aggregated.entries()).map(([price, amount]) => ({
    price,
    amount
  }));

  // Sort
  if (side === 'bid') {
    entries.sort((a, b) => b.price - a.price);
  } else {
    entries.sort((a, b) => a.price - b.price); // Asks usually sorted asc internally
  }

  // Calculate totals
  let total = 0;
  for (const entry of entries) {
    total += entry.amount;
    entry.total = total;
  }

  return entries;
};

const processUpdates = () => {
  if (!pendingUpdate) return;
  pendingUpdate = false;
  
  const processedBids = aggregateAndSort(state.bids, state.tickSize, 'bid').slice(0, 50);
  // Asks are often displayed reversed (highest at top) in the UI, 
  // but logically sorted ascending here. The UI will slice/reverse as needed.
  const processedAsks = aggregateAndSort(state.asks, state.tickSize, 'ask').slice(0, 50);
  
  self.postMessage({
    type: 'ORDERBOOK_PROCESSED',
    data: {
      bids: processedBids,
      asks: processedAsks,
    }
  });
};

self.onmessage = (e: MessageEvent) => {
  const { type, data } = e.data;
  
  if (type === 'SET_TICK_SIZE') {
    state.tickSize = data;
    pendingUpdate = true;
  } 
  else if (type === 'SNAPSHOT') {
    state.bids.clear();
    state.asks.clear();
    
    if (data.bids) data.bids.forEach(([p, a]: [number, number]) => state.bids.set(p, a));
    if (data.asks) data.asks.forEach(([p, a]: [number, number]) => state.asks.set(p, a));
    
    pendingUpdate = true;
  }
  else if (type === 'DELTA') {
    if (data.bids) data.bids.forEach(([p, a]: [number, number]) => {
      if (a <= 0) state.bids.delete(p);
      else state.bids.set(p, a);
    });
    
    if (data.asks) data.asks.forEach(([p, a]: [number, number]) => {
      if (a <= 0) state.asks.delete(p);
      else state.asks.set(p, a);
    });
    
    pendingUpdate = true;
  }
};

// Throttle updates to ~20fps (50ms)
setInterval(processUpdates, 50);
