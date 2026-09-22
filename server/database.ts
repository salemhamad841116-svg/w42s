import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/* ─── Database Path ─── */
const DB_DIR = path.resolve(import.meta.dirname, '..', 'data');
const DB_PATH = path.join(DB_DIR, 'candles.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

/* ─── Initialize Database ─── */
const db = new Database(DB_PATH);

// Performance tuning for write-heavy workload
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000'); // 64MB cache
db.pragma('temp_store = MEMORY');

/* ─── Create Tables ─── */
db.exec(`
  CREATE TABLE IF NOT EXISTS candles (
    symbol    TEXT    NOT NULL,
    timeframe TEXT    NOT NULL,
    time      INTEGER NOT NULL,
    open      REAL    NOT NULL,
    high      REAL    NOT NULL,
    low       REAL    NOT NULL,
    close     REAL    NOT NULL,
    volume    REAL    NOT NULL,
    PRIMARY KEY (symbol, timeframe, time)
  );

  CREATE INDEX IF NOT EXISTS idx_candles_lookup
    ON candles(symbol, timeframe, time);

  CREATE TABLE IF NOT EXISTS sync_state (
    symbol       TEXT NOT NULL,
    timeframe    TEXT NOT NULL,
    last_synced  INTEGER NOT NULL DEFAULT 0,
    candle_count INTEGER NOT NULL DEFAULT 0,
    updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (symbol, timeframe)
  );

  CREATE TABLE IF NOT EXISTS api_credentials (
    service       TEXT PRIMARY KEY,
    encrypted_key TEXT NOT NULL,
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

/* ─── Prepared Statements ─── */

// Insert/upsert a batch of candles
const insertCandleStmt = db.prepare(`
  INSERT OR REPLACE INTO candles (symbol, timeframe, time, open, high, low, close, volume)
  VALUES (@symbol, @timeframe, @time, @open, @high, @low, @close, @volume)
`);

const insertManyCandlesTx = db.transaction(
  (candles: Array<{
    symbol: string;
    timeframe: string;
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>) => {
    for (const c of candles) {
      insertCandleStmt.run(c);
    }
  }
);

// Query candles for chart (TradingView-compatible)
const queryCandlesStmt = db.prepare(`
  SELECT time, open, high, low, close, volume
  FROM candles
  WHERE symbol = ? AND timeframe = ? AND time >= ? AND time <= ?
  ORDER BY time ASC
  LIMIT ?
`);

// Count candles for a symbol+timeframe
const countCandlesStmt = db.prepare(`
  SELECT COUNT(*) as count FROM candles WHERE symbol = ? AND timeframe = ?
`);

// Get the latest candle time for incremental sync
const latestCandleTimeStmt = db.prepare(`
  SELECT MAX(time) as latest FROM candles WHERE symbol = ? AND timeframe = ?
`);

// Get the earliest candle time
const earliestCandleTimeStmt = db.prepare(`
  SELECT MIN(time) as earliest FROM candles WHERE symbol = ? AND timeframe = ?
`);

// Update sync state
const upsertSyncStateStmt = db.prepare(`
  INSERT OR REPLACE INTO sync_state (symbol, timeframe, last_synced, candle_count, updated_at)
  VALUES (?, ?, ?, ?, datetime('now'))
`);

// Get all sync states
const allSyncStatesStmt = db.prepare(`SELECT * FROM sync_state ORDER BY symbol, timeframe`);

/* ─── Public API ─── */

export interface CandleRow {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function insertCandles(
  candles: Array<{
    symbol: string;
    timeframe: string;
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>
): void {
  if (candles.length === 0) return;
  insertManyCandlesTx(candles);
}

export function queryCandles(
  symbol: string,
  timeframe: string,
  from: number,
  to: number,
  limit: number = 5000
): CandleRow[] {
  return queryCandlesStmt.all(symbol, timeframe, from, to, limit) as CandleRow[];
}

export function queryCandlesUnlimited(
  symbol: string,
  timeframe: string,
  from: number,
  to: number
): CandleRow[] {
  // For admin/AI export — no limit
  const stmt = db.prepare(`
    SELECT time, open, high, low, close, volume
    FROM candles
    WHERE symbol = ? AND timeframe = ? AND time >= ? AND time <= ?
    ORDER BY time ASC
  `);
  return stmt.all(symbol, timeframe, from, to) as CandleRow[];
}

export function countCandles(symbol: string, timeframe: string): number {
  const row = countCandlesStmt.get(symbol, timeframe) as { count: number };
  return row.count;
}

export function getLatestCandleTime(symbol: string, timeframe: string): number | null {
  const row = latestCandleTimeStmt.get(symbol, timeframe) as { latest: number | null };
  return row.latest;
}

export function getEarliestCandleTime(symbol: string, timeframe: string): number | null {
  const row = earliestCandleTimeStmt.get(symbol, timeframe) as { earliest: number | null };
  return row.earliest;
}

export function updateSyncState(symbol: string, timeframe: string): void {
  const count = countCandles(symbol, timeframe);
  const latest = getLatestCandleTime(symbol, timeframe) || 0;
  upsertSyncStateStmt.run(symbol, timeframe, latest, count);
}

export function getAllSyncStates(): Array<{
  symbol: string;
  timeframe: string;
  last_synced: number;
  candle_count: number;
  updated_at: string;
}> {
  return allSyncStatesStmt.all() as any[];
}

export function getDb() {
  return db;
}

export default db;
