import { fetchNewCandles, fetchFullHistory, ALL_SYMBOLS, ALL_TIMEFRAMES, type ProgressCallback } from './dataFetcher.js';

/* ─── Configuration ─── */
const SYNC_INTERVAL_MS = 60_000; // Incremental sync every 60 seconds
const INITIAL_SYNC_YEARS = 5;

// Priority order: larger timeframes first (faster to fetch, more useful quickly)
const TIMEFRAME_PRIORITY = ['1d', '4h', '1h', '15m', '5m', '1m'];

// Default symbols to sync
const DEFAULT_SYMBOLS = [
  'BTC/USDT',
  'ETH/USDT',
  'SOL/USDT',
  'XAU/USD',
  'EUR/USD',
  'GBP/USD',
];

/* ─── State ─── */
let isInitialSyncRunning = false;
let isIncrementalSyncRunning = false;
let syncTimer: ReturnType<typeof setInterval> | null = null;
let initialSyncProgress: Map<string, string> = new Map();

/* ─── Initial Sync (Background) ─── */
export async function runInitialSync(
  symbols: string[] = DEFAULT_SYMBOLS,
  yearsBack: number = INITIAL_SYNC_YEARS,
  onProgress?: ProgressCallback
): Promise<void> {
  if (isInitialSyncRunning) {
    console.log('⚠️  Initial sync already running.');
    return;
  }

  isInitialSyncRunning = true;
  console.log('🚀 Starting initial historical data sync...');
  console.log(`   Symbols: ${symbols.join(', ')}`);
  console.log(`   Timeframes: ${TIMEFRAME_PRIORITY.join(', ')}`);
  console.log(`   Range: last ${yearsBack} years\n`);

  const totalJobs = symbols.length * TIMEFRAME_PRIORITY.length;
  let completedJobs = 0;

  for (const timeframe of TIMEFRAME_PRIORITY) {
    for (const symbol of symbols) {
      const key = `${symbol}:${timeframe}`;
      try {
        initialSyncProgress.set(key, 'syncing...');

        const count = await fetchFullHistory(symbol, timeframe, yearsBack, (p) => {
          initialSyncProgress.set(key, p.phase);
          if (onProgress) onProgress(p);
        });

        completedJobs++;
        const pct = ((completedJobs / totalJobs) * 100).toFixed(1);
        initialSyncProgress.set(key, `✅ ${count} candles`);
        console.log(`[${pct}%] ✅ ${symbol} ${timeframe}: ${count} candles stored`);
      } catch (err: any) {
        completedJobs++;
        initialSyncProgress.set(key, `❌ ${err.message}`);
        console.error(`❌ Failed ${symbol} ${timeframe}:`, err.message);
      }
    }
  }

  isInitialSyncRunning = false;
  console.log('\n🏁 Initial sync complete!\n');
}

/* ─── Incremental Sync ─── */
async function runIncrementalSync(): Promise<void> {
  if (isIncrementalSyncRunning || isInitialSyncRunning) return;

  isIncrementalSyncRunning = true;

  for (const symbol of DEFAULT_SYMBOLS) {
    for (const timeframe of TIMEFRAME_PRIORITY) {
      try {
        const count = await fetchNewCandles(symbol, timeframe);
        if (count > 0) {
          console.log(`🔄 Incremental: ${symbol} ${timeframe} +${count} candles`);
        }
      } catch (err: any) {
        // Silent fail for incremental sync — will retry next cycle
      }
    }
  }

  isIncrementalSyncRunning = false;
}

/* ─── Scheduler Control ─── */
export function startIncrementalSync(): void {
  if (syncTimer) return;

  console.log(`⏰ Incremental sync scheduled every ${SYNC_INTERVAL_MS / 1000}s`);
  syncTimer = setInterval(runIncrementalSync, SYNC_INTERVAL_MS);

  // Run first incremental sync after a short delay
  setTimeout(runIncrementalSync, 5000);
}

export function stopIncrementalSync(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
    console.log('⏹  Incremental sync stopped.');
  }
}

/* ─── Manual Trigger ─── */
export async function syncNow(symbol: string, timeframe: string): Promise<number> {
  console.log(`🔄 Manual sync: ${symbol} ${timeframe}...`);
  return fetchNewCandles(symbol, timeframe);
}

/* ─── Status ─── */
export function getSyncStatus() {
  return {
    isInitialSyncRunning,
    isIncrementalSyncRunning,
    initialSyncProgress: Object.fromEntries(initialSyncProgress),
  };
}

export { DEFAULT_SYMBOLS, TIMEFRAME_PRIORITY };
