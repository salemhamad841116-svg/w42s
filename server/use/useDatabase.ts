/**
 * Universal Strategy Engine — Database Schema & Queries
 * 
 * Creates and manages SQLite tables for strategies, predictions,
 * backtests, and model tracking within the existing candles.db.
 */

import { getDb } from '../database.js';

/**
 * Initialize all USE tables in the existing SQLite database.
 * Called once on server boot.
 */
export function initializeUSEDatabase(): void {
  const db = getDb();

  db.exec(`
    -- Strategy definitions with lifecycle status
    CREATE TABLE IF NOT EXISTS use_strategies (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      description  TEXT NOT NULL DEFAULT '',
      language     TEXT NOT NULL DEFAULT 'javascript',
      version      TEXT NOT NULL DEFAULT '1.0.0',
      status       TEXT NOT NULL DEFAULT 'DRAFT',
      source_code  TEXT NOT NULL DEFAULT '',
      usr_json     TEXT NOT NULL DEFAULT '{}',
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Prediction audit log (stores every forecast BEFORE knowing result)
    CREATE TABLE IF NOT EXISTS use_predictions (
      prediction_id       TEXT PRIMARY KEY,
      timestamp           INTEGER NOT NULL,
      symbol              TEXT NOT NULL,
      timeframe           TEXT NOT NULL,
      strategy_version    TEXT NOT NULL DEFAULT '',
      model_version       TEXT NOT NULL DEFAULT 'USE-1.0.0',
      input_data_version  TEXT NOT NULL DEFAULT '',
      market_regime       TEXT NOT NULL DEFAULT 'UNCERTAIN',
      bullish_probability REAL NOT NULL DEFAULT 0,
      bearish_probability REAL NOT NULL DEFAULT 0,
      neutral_probability REAL NOT NULL DEFAULT 0,
      confidence          REAL NOT NULL DEFAULT 0,
      expected_range_high REAL NOT NULL DEFAULT 0,
      expected_range_low  REAL NOT NULL DEFAULT 0,
      actual_result       TEXT,
      actual_close        REAL,
      evaluation_status   TEXT NOT NULL DEFAULT 'PENDING',
      created_at          TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_predictions_lookup
      ON use_predictions(symbol, timeframe, timestamp);

    CREATE INDEX IF NOT EXISTS idx_predictions_status
      ON use_predictions(evaluation_status);

    -- Backtest results
    CREATE TABLE IF NOT EXISTS use_backtests (
      id              TEXT PRIMARY KEY,
      strategy_id     TEXT NOT NULL,
      symbol          TEXT NOT NULL,
      timeframe       TEXT NOT NULL,
      start_date      TEXT NOT NULL,
      end_date        TEXT NOT NULL,
      total_trades    INTEGER NOT NULL DEFAULT 0,
      win_rate        REAL NOT NULL DEFAULT 0,
      profit_factor   REAL NOT NULL DEFAULT 0,
      max_drawdown    REAL NOT NULL DEFAULT 0,
      sharpe_ratio    REAL NOT NULL DEFAULT 0,
      expectancy      REAL NOT NULL DEFAULT 0,
      oos_win_rate    REAL NOT NULL DEFAULT 0,
      overfitting_risk INTEGER NOT NULL DEFAULT 0,
      result_json     TEXT NOT NULL DEFAULT '{}',
      computed_at     TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (strategy_id) REFERENCES use_strategies(id)
    );

    CREATE INDEX IF NOT EXISTS idx_backtests_strategy
      ON use_backtests(strategy_id);

    -- Model versions for tracking
    CREATE TABLE IF NOT EXISTS use_models (
      id              TEXT PRIMARY KEY,
      strategy_id     TEXT NOT NULL,
      version         TEXT NOT NULL,
      model_type      TEXT NOT NULL DEFAULT 'statistical',
      accuracy        REAL NOT NULL DEFAULT 0,
      oos_accuracy    REAL NOT NULL DEFAULT 0,
      feature_importance TEXT NOT NULL DEFAULT '{}',
      status          TEXT NOT NULL DEFAULT 'DRAFT',
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (strategy_id) REFERENCES use_strategies(id)
    );

    -- Calibration tracking for Live Learning Dashboard
    CREATE TABLE IF NOT EXISTS use_calibration_logs (
      id TEXT PRIMARY KEY,
      prediction_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      timeframe TEXT NOT NULL,
      predicted_probability REAL NOT NULL,
      actual_outcome INTEGER NOT NULL,
      ev_score REAL NOT NULL,
      grade TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (prediction_id) REFERENCES use_predictions(prediction_id)
    );

    -- Paper Trading Account
    CREATE TABLE IF NOT EXISTS use_paper_account (
      id TEXT PRIMARY KEY,
      balance REAL NOT NULL DEFAULT 100000,
      equity REAL NOT NULL DEFAULT 100000,
      margin REAL NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );

    -- Insert default paper account if missing
    INSERT OR IGNORE INTO use_paper_account (id, balance, equity, margin, updated_at)
    VALUES ('default', 100000, 100000, 0, strftime('%s', 'now'));

    -- Paper Trades
    CREATE TABLE IF NOT EXISTS use_paper_trades (
      trade_id TEXT PRIMARY KEY,
      prediction_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      side TEXT NOT NULL,
      entry_price REAL NOT NULL,
      sl_price REAL NOT NULL,
      tp_price REAL NOT NULL,
      size REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      exit_price REAL,
      exit_time INTEGER,
      realized_r REAL,
      mfe REAL,
      mae REAL,
      bars_held INTEGER,
      trading_costs REAL NOT NULL DEFAULT 0,
      net_pnl REAL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (prediction_id) REFERENCES use_predictions(prediction_id)
    );
  `);

  try {
    const pragma = db.prepare('PRAGMA table_info(use_predictions)').all();
    const cols = pragma.map((p: any) => p.name);
    
    // Add evaluation and confluence fields
    if (!cols.includes('ev_score')) db.exec('ALTER TABLE use_predictions ADD COLUMN ev_score REAL NOT NULL DEFAULT 0');
    if (!cols.includes('signal_grade')) db.exec("ALTER TABLE use_predictions ADD COLUMN signal_grade TEXT NOT NULL DEFAULT 'NO_TRADE'");
    if (!cols.includes('confluence_score')) db.exec("ALTER TABLE use_predictions ADD COLUMN confluence_score REAL NOT NULL DEFAULT 0");

    // Add paper trading snapshot fields
    if (!cols.includes('htf_bias')) db.exec("ALTER TABLE use_predictions ADD COLUMN htf_bias TEXT NOT NULL DEFAULT 'NEUTRAL'");
    if (!cols.includes('ltf_timing')) db.exec("ALTER TABLE use_predictions ADD COLUMN ltf_timing TEXT NOT NULL DEFAULT 'NEUTRAL'");
    if (!cols.includes('entry_price')) db.exec("ALTER TABLE use_predictions ADD COLUMN entry_price REAL NOT NULL DEFAULT 0");
    if (!cols.includes('tp_price')) db.exec("ALTER TABLE use_predictions ADD COLUMN tp_price REAL NOT NULL DEFAULT 0");
    if (!cols.includes('sl_price')) db.exec("ALTER TABLE use_predictions ADD COLUMN sl_price REAL NOT NULL DEFAULT 0");
    if (!cols.includes('estimated_spread')) db.exec("ALTER TABLE use_predictions ADD COLUMN estimated_spread REAL NOT NULL DEFAULT 0");
    if (!cols.includes('estimated_slippage')) db.exec("ALTER TABLE use_predictions ADD COLUMN estimated_slippage REAL NOT NULL DEFAULT 0");

  } catch (err) {
    console.error('Failed to alter use_predictions', err);
  }

  console.log('🧠 USE Database: Tables initialized successfully.');
}

// ──────────────────────────────────────────────
// STRATEGY CRUD
// ──────────────────────────────────────────────

export function insertStrategy(strategy: {
  id: string;
  name: string;
  description: string;
  language: string;
  version: string;
  status: string;
  sourceCode: string;
  usrJson: string;
}): void {
  const db = getDb();
  db.prepare(`
    INSERT OR REPLACE INTO use_strategies (id, name, description, language, version, status, source_code, usr_json, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(strategy.id, strategy.name, strategy.description, strategy.language, strategy.version, strategy.status, strategy.sourceCode, strategy.usrJson);
}

export function getStrategy(id: string): any {
  const db = getDb();
  return db.prepare(`SELECT * FROM use_strategies WHERE id = ?`).get(id);
}

export function getAllStrategies(): any[] {
  const db = getDb();
  return db.prepare(`SELECT id, name, description, language, version, status, created_at, updated_at FROM use_strategies ORDER BY updated_at DESC`).all();
}

export function updateStrategyStatus(id: string, status: string): void {
  const db = getDb();
  db.prepare(`UPDATE use_strategies SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, id);
}

// ──────────────────────────────────────────────
// PREDICTION AUDIT LOG
// ──────────────────────────────────────────────

export function insertPrediction(pred: {
  predictionId: string;
  timestamp: number;
  symbol: string;
  timeframe: string;
  strategyVersion: string;
  modelVersion: string;
  marketRegime: string;
  bullishProbability: number;
  bearishProbability: number;
  neutralProbability: number;
  confidence: number;
  expectedRangeHigh: number;
  expectedRangeLow: number;
}): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO use_predictions (
      prediction_id, timestamp, symbol, timeframe, strategy_version, model_version,
      market_regime, bullish_probability, bearish_probability, neutral_probability,
      confidence, expected_range_high, expected_range_low
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    pred.predictionId, pred.timestamp, pred.symbol, pred.timeframe,
    pred.strategyVersion, pred.modelVersion, pred.marketRegime,
    pred.bullishProbability, pred.bearishProbability, pred.neutralProbability,
    pred.confidence, pred.expectedRangeHigh, pred.expectedRangeLow
  );
}

export function evaluatePrediction(predictionId: string, actualResult: string, actualClose: number): void {
  const db = getDb();
  db.prepare(`
    UPDATE use_predictions
    SET actual_result = ?, actual_close = ?, evaluation_status = 'EVALUATED'
    WHERE prediction_id = ?
  `).run(actualResult, actualClose, predictionId);
}

export function getPendingPredictions(symbol: string, timeframe: string): any[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM use_predictions
    WHERE symbol = ? AND timeframe = ? AND evaluation_status = 'PENDING'
    ORDER BY timestamp ASC
  `).all(symbol, timeframe);
}

export function getRecentPredictions(limit: number = 100): any[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM use_predictions ORDER BY timestamp DESC LIMIT ?
  `).all(limit);
}

export function getCalibrationData(symbol: string, timeframe: string): any[] {
  const db = getDb();
  return db.prepare(`
    SELECT bullish_probability, bearish_probability, neutral_probability,
           confidence, actual_result
    FROM use_predictions
    WHERE symbol = ? AND timeframe = ? AND evaluation_status = 'EVALUATED'
    ORDER BY timestamp DESC
    LIMIT 5000
  `).all(symbol, timeframe);
}

// ──────────────────────────────────────────────
// BACKTEST RESULTS
// ──────────────────────────────────────────────

export function insertBacktest(bt: {
  id: string;
  strategyId: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  expectancy: number;
  oosWinRate: number;
  overfittingRisk: boolean;
  resultJson: string;
}): void {
  const db = getDb();
  db.prepare(`
    INSERT OR REPLACE INTO use_backtests (
      id, strategy_id, symbol, timeframe, start_date, end_date,
      total_trades, win_rate, profit_factor, max_drawdown, sharpe_ratio,
      expectancy, oos_win_rate, overfitting_risk, result_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    bt.id, bt.strategyId, bt.symbol, bt.timeframe, bt.startDate, bt.endDate,
    bt.totalTrades, bt.winRate, bt.profitFactor, bt.maxDrawdown, bt.sharpeRatio,
    bt.expectancy, bt.oosWinRate, bt.overfittingRisk ? 1 : 0, bt.resultJson
  );
}

export function getBacktestsForStrategy(strategyId: string): any[] {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM use_backtests WHERE strategy_id = ? ORDER BY computed_at DESC
  `).all(strategyId);
}
