/**
 * Universal Strategy Engine — Admin API Routes
 * 
 * Strategy lifecycle management, backtest execution, and model tracking.
 * Only accessible from the Admin dashboard.
 */

import { Router, type Request, type Response } from 'express';
import {
  insertStrategy,
  getStrategy,
  getAllStrategies,
  updateStrategyStatus,
  getBacktestsForStrategy,
  getRecentPredictions,
} from '../useDatabase.js';
import { parseStrategy, validateSecurely, detectLanguage } from '../strategyParser.js';
import { runBacktest } from '../backtestEngine.js';
import { evaluatePendingPredictions } from '../predictionLogger.js';
import { getCalibrationDashboard } from '../confidenceCalibrator.js';

const router = Router();

/**
 * GET /api/use/admin/strategies
 * List all strategies with their lifecycle status.
 */
router.get('/strategies', (_req: Request, res: Response) => {
  try {
    const strategies = getAllStrategies();
    res.json(strategies);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/use/admin/strategies
 * Create/upload a new strategy.
 * Body: { name, code, description? }
 */
router.post('/strategies', (req: Request, res: Response) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required.' });
    }

    const id = `strat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const language = detectLanguage(code);
    const parsed = parseStrategy(code, name, id);

    insertStrategy({
      id,
      name,
      description: description || '',
      language,
      version: '1.0.0',
      status: 'DRAFT',
      sourceCode: code,
      usrJson: JSON.stringify(parsed),
    });

    res.json({ success: true, id, language, status: 'DRAFT' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/use/admin/strategies/:id
 * Get full strategy details including source code and USR.
 */
router.get('/strategies/:id', (req: Request, res: Response) => {
  try {
    const strategy = getStrategy(req.params.id);
    if (!strategy) return res.status(404).json({ error: 'Strategy not found.' });
    res.json(strategy);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/use/admin/strategies/:id/validate
 * Run security validation on strategy code.
 */
router.put('/strategies/:id/validate', (req: Request, res: Response) => {
  try {
    const strategy = getStrategy(req.params.id);
    if (!strategy) return res.status(404).json({ error: 'Strategy not found.' });

    const result = validateSecurely(strategy.source_code);
    if (result.valid) {
      updateStrategyStatus(req.params.id, 'VALIDATED');
      res.json({ success: true, status: 'VALIDATED' });
    } else {
      res.json({ success: false, errors: result.errors, status: 'DRAFT' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/use/admin/strategies/:id/backtest
 * Launch a backtest job for a strategy.
 * Body: { symbol, timeframe }
 */
router.post('/strategies/:id/backtest', async (req: Request, res: Response) => {
  try {
    const strategy = getStrategy(req.params.id);
    if (!strategy) return res.status(404).json({ error: 'Strategy not found.' });

    const { symbol, timeframe } = req.body;
    if (!symbol || !timeframe) {
      return res.status(400).json({ error: 'Symbol and timeframe are required.' });
    }

    // Parse the USR from stored JSON
    const usr = JSON.parse(strategy.usr_json);

    // Run backtest (this can take seconds for large datasets)
    const result = await runBacktest(usr, symbol, timeframe);

    // Update strategy status
    updateStrategyStatus(req.params.id, 'BACKTESTED');

    res.json({
      success: true,
      status: 'BACKTESTED',
      result: {
        totalTrades: result.totalTrades,
        winRate: result.winRate,
        profitFactor: result.profitFactor,
        maxDrawdownPct: result.maxDrawdownPct,
        sharpeRatio: result.sharpeRatio,
        expectancy: result.expectancy,
        oosPerformance: result.oosPerformance,
        overfittingRisk: result.overfittingRisk,
        byHour: result.byHour,
        byWeekday: result.byWeekday,
        byRegime: result.byRegime,
      },
    });
  } catch (err: any) {
    console.error('Backtest error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/use/admin/strategies/:id/status
 * Change strategy lifecycle status.
 * Body: { status: 'APPROVED' | 'PUBLISHED' | 'DISABLED' }
 */
router.put('/strategies/:id/status', (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ['DRAFT', 'VALIDATED', 'BACKTESTED', 'APPROVED', 'PUBLISHED', 'DISABLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    updateStrategyStatus(req.params.id, status);
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/use/admin/backtests/:strategyId
 * Get all backtest results for a strategy.
 */
router.get('/backtests/:strategyId', (req: Request, res: Response) => {
  try {
    const backtests = getBacktestsForStrategy(req.params.strategyId);
    res.json(backtests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/use/admin/predictions?limit=100
 * Get prediction audit log.
 */
router.get('/predictions', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const predictions = getRecentPredictions(limit);
    res.json(predictions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/use/admin/evaluate-predictions
 * Manually trigger evaluation of pending predictions.
 */
router.post('/evaluate-predictions', async (_req: Request, res: Response) => {
  try {
    const count = await evaluatePendingPredictions();
    res.json({ success: true, evaluated: count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/use/admin/calibration?symbol=...&timeframe=...
 */
router.get('/calibration', (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || 'BTC/USDT';
    const timeframe = (req.query.timeframe as string) || '5m';
    const dashboard = getCalibrationDashboard(symbol, timeframe);
    res.json(dashboard);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import { getValidationDashboard } from '../validationService.js';
import { getDb } from '../../database.js';

/**
 * GET /api/use/admin/validation-dashboard
 * Get forward validation performance metrics.
 */
router.get('/validation-dashboard', (req: Request, res: Response) => {
  try {
    const dashboard = getValidationDashboard();
    res.json(dashboard);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/use/admin/paper-account/reset
 * Reset the virtual account balance and clear paper trades.
 */
router.post('/paper-account/reset', (req: Request, res: Response) => {
  try {
    const db = getDb();
    
    // Begin transaction
    db.exec('BEGIN TRANSACTION');
    try {
      db.exec('DELETE FROM use_paper_trades');
      db.prepare(`
        UPDATE use_paper_account 
        SET balance = 100000, equity = 100000, margin = 0, updated_at = ?
        WHERE id = 'default'
      `).run(Math.floor(Date.now() / 1000));
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
    
    res.json({ success: true, message: 'Account reset successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

