import { Router, type Request, type Response } from 'express';
import { queryCandlesUnlimited, getAllSyncStates, countCandles, getLatestCandleTime, getEarliestCandleTime } from '../database.js';
import { syncNow, getSyncStatus, runInitialSync } from '../syncScheduler.js';
import { getMaskedKeys, setKey } from '../keyManager.js';
import { getVersionManifest, getVersionHistory, updateVersion, setForceUpdate, rollbackVersion } from '../versionManager.js';

const router = Router();

/* ─── API Keys Management ─── */
router.get('/keys', (_req: Request, res: Response) => {
  res.json(getMaskedKeys());
});

router.post('/keys', (req: Request, res: Response) => {
  const { service, key } = req.body;
  if (!service || !key) {
    return res.status(400).json({ error: 'Service and key are required' });
  }
  
  if (['gemini', 'finnhub', 'mt5', 'binance', 'binance_secret', 'mt5_account_id'].includes(service)) {
    setKey(service as any, key);
    res.json({ success: true, masked: getMaskedKeys()[service] });
  } else {
    res.status(400).json({ error: 'Invalid service' });
  }
});

/* ─── Historical Export for AI ─── */
function resolveTimeframe(resolution: string): string {
  const map: Record<string, string> = {
    '1': '1m', '5': '5m', '15': '15m', '60': '1h', '240': '4h',
    'D': '1d', '1D': '1d',
    '1m': '1m', '5m': '5m', '15m': '15m', '1h': '1h', '4h': '4h', '1d': '1d',
  };
  return map[resolution] || '1h';
}

/**
 * GET /api/admin/historical-export
 * 
 * Bulk export endpoint for AI/backtesting.
 * No candle count limit — returns everything in the requested range.
 *
 * Query params:
 *   symbol     - e.g. "BTC/USDT"
 *   resolution - e.g. "1h", "1D"
 *   from       - ISO date string (e.g. "2023-01-01") or Unix timestamp
 *   to         - ISO date string or Unix timestamp
 *   format     - "json" (default) or "csv"
 */
router.get('/historical-export', (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || 'BTC/USDT';
    const resolution = (req.query.resolution as string) || '1h';
    const timeframe = resolveTimeframe(resolution);
    const format = (req.query.format as string) || 'json';

    // Parse from/to — accept ISO dates or Unix timestamps
    let from: number;
    let to: number;

    const fromStr = req.query.from as string;
    const toStr = req.query.to as string;

    if (fromStr && fromStr.includes('-')) {
      from = Math.floor(new Date(fromStr).getTime() / 1000);
    } else {
      from = parseInt(fromStr) || Math.floor(Date.now() / 1000) - 365 * 86400;
    }

    if (toStr && toStr.includes('-')) {
      to = Math.floor(new Date(toStr).getTime() / 1000);
    } else {
      to = parseInt(toStr) || Math.floor(Date.now() / 1000);
    }

    const candles = queryCandlesUnlimited(symbol, timeframe, from, to);

    // Summary stats
    const summary = {
      symbol,
      timeframe,
      from: new Date(from * 1000).toISOString(),
      to: new Date(to * 1000).toISOString(),
      count: candles.length,
      highestPrice: candles.length > 0 ? Math.max(...candles.map(c => c.high)) : 0,
      lowestPrice: candles.length > 0 ? Math.min(...candles.map(c => c.low)) : 0,
    };

    if (format === 'csv') {
      // CSV export
      res.set('Content-Type', 'text/csv');
      res.set('Content-Disposition', `attachment; filename="${symbol.replace('/', '-')}_${timeframe}_${fromStr}_${toStr}.csv"`);
      
      let csv = 'time,date,open,high,low,close,volume\n';
      for (const c of candles) {
        const date = new Date(c.time * 1000).toISOString();
        csv += `${c.time},${date},${c.open},${c.high},${c.low},${c.close},${c.volume}\n`;
      }
      res.send(csv);
      return;
    }

    // JSON export
    res.json({
      summary,
      candles,
    });
  } catch (err: any) {
    console.error('Error in /api/admin/historical-export:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/sync-status
 * 
 * Returns the sync state for all symbol/timeframe combinations.
 */
router.get('/sync-status', (_req: Request, res: Response) => {
  try {
    const states = getAllSyncStates();
    const status = getSyncStatus();

    const detailed = states.map((s) => ({
      ...s,
      last_synced_date: s.last_synced ? new Date(s.last_synced * 1000).toISOString() : null,
    }));

    res.json({
      ...status,
      states: detailed,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/sync-now
 * 
 * Triggers an immediate incremental sync for a specific symbol/timeframe.
 * Body: { symbol: "BTC/USDT", timeframe: "1h" }
 */
router.post('/sync-now', async (req: Request, res: Response) => {
  try {
    const { symbol, timeframe } = req.body || {};
    if (!symbol || !timeframe) {
      res.status(400).json({ error: 'Missing symbol or timeframe' });
      return;
    }

    const count = await syncNow(symbol, resolveTimeframe(timeframe));
    res.json({ success: true, symbol, timeframe, newCandles: count });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/sync-initial
 * 
 * Triggers a full initial sync in the background.
 * Body: { symbols?: string[], yearsBack?: number }
 */
router.post('/sync-initial', async (req: Request, res: Response) => {
  try {
    const { symbols, yearsBack } = req.body || {};

    // Run in background — don't await
    runInitialSync(symbols, yearsBack || 5).catch(console.error);

    res.json({
      success: true,
      message: 'Initial sync started in background. Check /api/admin/sync-status for progress.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/admin/data-summary
 * 
 * Quick overview of all stored data.
 */
router.get('/data-summary', (_req: Request, res: Response) => {
  try {
    const states = getAllSyncStates();

    const symbols = [...new Set(states.map(s => s.symbol))];
    const totalCandles = states.reduce((sum, s) => sum + s.candle_count, 0);

    res.json({
      totalSymbols: symbols.length,
      totalCandles,
      symbols,
      breakdown: states,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* ─── Application Version Management & Updates ─── */
router.get('/version', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json(getVersionManifest());
});

router.get('/version/history', (_req: Request, res: Response) => {
  res.json(getVersionHistory());
});

router.post('/version/publish', (req: Request, res: Response) => {
  try {
    const { version, buildId, minimumSupportedVersion, forceUpdate, releaseNotes } = req.body || {};
    const updated = updateVersion({
      version,
      buildId,
      minimumSupportedVersion,
      forceUpdate,
      releaseNotes,
    });
    res.json({ success: true, manifest: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/version/force-update', (req: Request, res: Response) => {
  try {
    const { force } = req.body;
    const updated = setForceUpdate(Boolean(force));
    res.json({ success: true, manifest: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/version/rollback', (_req: Request, res: Response) => {
  try {
    const rolled = rollbackVersion();
    if (!rolled) {
      return res.status(400).json({ error: 'No previous version available to rollback to' });
    }
    res.json({ success: true, manifest: rolled });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
