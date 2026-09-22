import { getDb } from '../database.js';

const db = getDb();

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS use_calibration_logs (
      id TEXT PRIMARY KEY,
      prediction_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      timeframe TEXT NOT NULL,
      predicted_probability REAL NOT NULL,
      actual_outcome INTEGER NOT NULL, -- 1 for win, 0 for loss
      ev_score REAL NOT NULL,
      grade TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (prediction_id) REFERENCES use_predictions(prediction_id)
    );
  `);
  
  // Safe add columns to use_predictions
  const pragma = db.prepare('PRAGMA table_info(use_predictions)').all();
  const cols = pragma.map(p => p.name);
  
  if (!cols.includes('ev_score')) {
    db.exec('ALTER TABLE use_predictions ADD COLUMN ev_score REAL NOT NULL DEFAULT 0');
  }
  if (!cols.includes('signal_grade')) {
    db.exec("ALTER TABLE use_predictions ADD COLUMN signal_grade TEXT NOT NULL DEFAULT 'NO_TRADE'");
  }
  if (!cols.includes('confluence_score')) {
    db.exec("ALTER TABLE use_predictions ADD COLUMN confluence_score REAL NOT NULL DEFAULT 0");
  }
  console.log('Successfully updated USE database schema.');
} catch (err) {
  console.error('Error updating schema:', err);
}
