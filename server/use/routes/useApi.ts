/**
 * Universal Strategy Engine — Public API Routes
 * 
 * Exposes analysis endpoints for the Trading Platform frontend.
 * These are read-only analysis endpoints (no trade execution).
 */

import { Router, type Request, type Response } from 'express';
import { computeDirectionMatrix } from '../directionMatrix.js';
import { forecastNextCandle } from '../nextCandleForecaster.js';
import { detectRegimeForSymbol } from '../regimeDetector.js';
import { getRecentPredictions } from '../useDatabase.js';
import { computeConfluence } from '../confluenceEngine.js';

const router = Router();

/**
 * GET /api/use/direction-matrix?symbol=EUR/USD
 * 
 * Returns multi-timeframe direction analysis with independent
 * probabilities for each horizon.
 */
router.get('/direction-matrix', async (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || 'BTC/USDT';
    const result = await computeDirectionMatrix(symbol);
    res.json(result);
  } catch (err: any) {
    console.error('USE direction-matrix error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/use/next-candle?symbol=EUR/USD&timeframe=5m
 * 
 * Returns statistical next-candle probability forecast.
 * Stores the prediction in the audit log BEFORE knowing the outcome.
 */
router.get('/next-candle', async (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || 'BTC/USDT';
    const timeframe = (req.query.timeframe as string) || '5m';
    const forecast = await forecastNextCandle(symbol, timeframe);
    res.json(forecast);
  } catch (err: any) {
    console.error('USE next-candle error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/use/regime?symbol=EUR/USD
 * 
 * Returns the current market regime classification.
 */
router.get('/regime', async (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || 'BTC/USDT';
    const timeframe = (req.query.timeframe as string) || '1h';
    const result = await detectRegimeForSymbol(symbol, timeframe);
    res.json(result);
  } catch (err: any) {
    console.error('USE regime error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/use/predictions?limit=50
 * 
 * Returns recent prediction audit log entries.
 */
router.get('/predictions', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const predictions = getRecentPredictions(limit);
    res.json(predictions);
  } catch (err: any) {
    console.error('USE predictions error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/use/confluence?symbol=...&timeframe=...
 */
router.get('/confluence', async (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || 'BTC/USDT';
    const timeframe = (req.query.timeframe as string) || '5m';
    const result = await computeConfluence(symbol, timeframe);
    res.json(result);
  } catch (err: any) {
    console.error('USE confluence error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
