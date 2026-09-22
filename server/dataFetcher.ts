import { insertCandles, getLatestCandleTime, updateSyncState } from './database.js';

/* ─── Symbol Mapping ─── */
const SYMBOL_MAP: Record<string, { binance: string; type: 'crypto' | 'forex' | 'commodity' }> = {
  'BTC/USDT':  { binance: 'BTCUSDT',  type: 'crypto' },
  'ETH/USDT':  { binance: 'ETHUSDT',  type: 'crypto' },
  'SOL/USDT':  { binance: 'SOLUSDT',  type: 'crypto' },
  'XAU/USDT':  { binance: 'PAXGUSDT', type: 'commodity' },
  'EUR/USDT':  { binance: 'EURUSDT',  type: 'forex' },
  'GBP/USDT':  { binance: 'GBPUSDT',  type: 'forex' },
  // Map UI forex pairs to Binance stablecoin equivalents
  'EUR/USD':   { binance: 'EURUSDT',  type: 'forex' },
  'GBP/USD':   { binance: 'GBPUSDT',  type: 'forex' },
  'XAU/USD':   { binance: 'PAXGUSDT', type: 'commodity' },
};

/* ─── Timeframe Mapping ─── */
const TIMEFRAME_MAP: Record<string, { binance: string; ms: number }> = {
  '1m':  { binance: '1m',  ms: 60 * 1000 },
  '5m':  { binance: '5m',  ms: 5 * 60 * 1000 },
  '15m': { binance: '15m', ms: 15 * 60 * 1000 },
  '1h':  { binance: '1h',  ms: 60 * 60 * 1000 },
  '4h':  { binance: '4h',  ms: 4 * 60 * 60 * 1000 },
  '1d':  { binance: '1d',  ms: 24 * 60 * 60 * 1000 },
};

export const ALL_SYMBOLS = Object.keys(SYMBOL_MAP);
export const ALL_TIMEFRAMES = Object.keys(TIMEFRAME_MAP);

/* ─── Rate Limiter ─── */
const DELAY_BETWEEN_REQUESTS_MS = 120; // ~500 req/min (well under 1200 limit)

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ─── Binance Kline Fetcher ─── */
interface BinanceKline {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

async function fetchBinanceKlines(
  binanceSymbol: string,
  interval: string,
  startTime: number,
  endTime: number,
  limit: number = 1000
): Promise<BinanceKline[]> {
  const url = new URL('https://api.binance.com/api/v3/klines');
  url.searchParams.set('symbol', binanceSymbol);
  url.searchParams.set('interval', interval);
  url.searchParams.set('startTime', startTime.toString());
  url.searchParams.set('endTime', endTime.toString());
  url.searchParams.set('limit', limit.toString());

  const response = await fetch(url.toString());

  if (response.status === 429) {
    console.warn('⚠️  Rate limited by Binance. Waiting 60 seconds...');
    await sleep(60_000);
    return fetchBinanceKlines(binanceSymbol, interval, startTime, endTime, limit);
  }

  if (!response.ok) {
    throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
  }

  const data: any[][] = await response.json();

  return data.map((k) => ({
    time: Math.floor(k[0] / 1000), // Convert ms to seconds
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
}

/* ─── Paginated Historical Fetch ─── */
export interface FetchProgress {
  symbol: string;
  timeframe: string;
  fetched: number;
  total: string;
  phase: string;
}

export type ProgressCallback = (progress: FetchProgress) => void;

/**
 * Fetch historical candles for a symbol+timeframe from startTime to endTime.
 * Handles Binance's 1000-candle-per-request limit via pagination.
 */
export async function fetchHistoricalRange(
  symbol: string,
  timeframe: string,
  startTime: number, // Unix seconds
  endTime: number,   // Unix seconds
  onProgress?: ProgressCallback
): Promise<number> {
  const symInfo = SYMBOL_MAP[symbol];
  if (!symInfo) {
    console.warn(`Unknown symbol: ${symbol}, skipping.`);
    return 0;
  }

  const tfInfo = TIMEFRAME_MAP[timeframe];
  if (!tfInfo) {
    console.warn(`Unknown timeframe: ${timeframe}, skipping.`);
    return 0;
  }

  let cursor = startTime * 1000; // Binance uses milliseconds
  const endMs = endTime * 1000;
  let totalFetched = 0;
  const batchSize = 1000;

  while (cursor < endMs) {
    try {
      const klines = await fetchBinanceKlines(
        symInfo.binance,
        tfInfo.binance,
        cursor,
        endMs,
        batchSize
      );

      if (klines.length === 0) break;

      // Prepare for DB insert
      const candles = klines.map((k) => ({
        symbol,
        timeframe,
        ...k,
      }));

      insertCandles(candles);
      totalFetched += klines.length;

      // Move cursor past last candle
      const lastKlineMs = klines[klines.length - 1].time * 1000;
      cursor = lastKlineMs + tfInfo.ms;

      // Progress callback
      if (onProgress) {
        onProgress({
          symbol,
          timeframe,
          fetched: totalFetched,
          total: 'unknown',
          phase: `Fetched ${totalFetched} candles (last: ${new Date(lastKlineMs).toISOString().split('T')[0]})`,
        });
      }

      // Rate limiting
      await sleep(DELAY_BETWEEN_REQUESTS_MS);

      // If we got less than batchSize, we've reached the end
      if (klines.length < batchSize) break;
    } catch (err: any) {
      console.error(`Error fetching ${symbol} ${timeframe}:`, err.message);
      // Wait and retry
      await sleep(5000);
    }
  }

  // Update sync state
  updateSyncState(symbol, timeframe);

  return totalFetched;
}

/**
 * Incremental sync: fetch only new candles since the last stored one.
 */
export async function fetchNewCandles(
  symbol: string,
  timeframe: string
): Promise<number> {
  const tfInfo = TIMEFRAME_MAP[timeframe];
  if (!tfInfo) return 0;

  const latest = getLatestCandleTime(symbol, timeframe);
  const now = Math.floor(Date.now() / 1000);

  // If no data at all, fetch last 24 hours as a quick bootstrap
  const startTime = latest ? latest + (tfInfo.ms / 1000) : now - 86400;

  if (startTime >= now) return 0; // Already up to date

  return fetchHistoricalRange(symbol, timeframe, startTime, now);
}

/**
 * Full historical fetch: fetch data from yearsBack years ago to now.
 */
export async function fetchFullHistory(
  symbol: string,
  timeframe: string,
  yearsBack: number = 5,
  onProgress?: ProgressCallback
): Promise<number> {
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - yearsBack * 365 * 24 * 60 * 60;

  // Check if we already have data — start from where we left off
  const latest = getLatestCandleTime(symbol, timeframe);
  const effectiveStart = latest ? latest + 1 : startTime;

  if (effectiveStart >= now) {
    console.log(`✅ ${symbol} ${timeframe} already up to date.`);
    return 0;
  }

  console.log(
    `📥 Fetching ${symbol} ${timeframe} from ${new Date(effectiveStart * 1000).toISOString().split('T')[0]} to now...`
  );

  return fetchHistoricalRange(symbol, timeframe, effectiveStart, now, onProgress);
}

export { SYMBOL_MAP, TIMEFRAME_MAP };
