import { Router, type Request, type Response } from 'express';
import { queryCandles, countCandles, getLatestCandleTime, getEarliestCandleTime } from '../database.js';

const router = Router();

/* ─── Resolution Mapping ─── */
// TradingView uses resolutions like '1', '5', '15', '60', '240', '1D'
// We normalize them to our timeframe keys
function resolveTimeframe(resolution: string): string {
  const map: Record<string, string> = {
    '1':   '1m',
    '5':   '5m',
    '15':  '15m',
    '60':  '1h',
    '240': '4h',
    'D':   '1d',
    '1D':  '1d',
    // Also accept our format directly
    '1m':  '1m',
    '5m':  '5m',
    '15m': '15m',
    '1h':  '1h',
    '4h':  '4h',
    '1d':  '1d',
  };
  return map[resolution] || '15m';
}

/**
 * GET /api/datafeed/history
 * 
 * TradingView-compatible history endpoint.
 * 
 * Query params:
 *   symbol     - e.g. "BTC/USDT"
 *   resolution - e.g. "15", "60", "1D"
 *   from       - Unix timestamp (seconds)
 *   to         - Unix timestamp (seconds)
 *   countback  - (optional) Number of bars to return
 */
router.get('/history', (req: Request, res: Response) => {
  try {
    const symbol = (req.query.symbol as string) || 'BTC/USDT';
    const resolution = (req.query.resolution as string) || '15';
    const timeframe = resolveTimeframe(resolution);

    const from = parseInt(req.query.from as string) || Math.floor(Date.now() / 1000) - 86400;
    const to = parseInt(req.query.to as string) || Math.floor(Date.now() / 1000);
    const countback = parseInt(req.query.countback as string) || 5000;

    const candles = queryCandles(symbol, timeframe, from, to, countback);

    if (candles.length === 0) {
      res.json({
        s: 'no_data',
        nextTime: getEarliestCandleTime(symbol, timeframe) || undefined,
      });
      return;
    }

    // TradingView format: separate arrays for each field
    const t: number[] = [];
    const o: number[] = [];
    const h: number[] = [];
    const l: number[] = [];
    const c: number[] = [];
    const v: number[] = [];

    for (const candle of candles) {
      t.push(candle.time);
      o.push(candle.open);
      h.push(candle.high);
      l.push(candle.low);
      c.push(candle.close);
      v.push(candle.volume);
    }

    res.set('Cache-Control', 'public, max-age=5'); // Short cache for recent data
    res.json({ s: 'ok', t, o, h, l, c, v });
  } catch (err: any) {
    console.error('Error in /api/datafeed/history:', err.message);
    res.status(500).json({ s: 'error', errmsg: err.message });
  }
});

/**
 * GET /api/datafeed/config
 * 
 * TradingView datafeed configuration.
 */
router.get('/config', (_req: Request, res: Response) => {
  res.json({
    supports_search: false,
    supports_group_request: false,
    supported_resolutions: ['1', '5', '15', '60', '240', '1D'],
    supports_marks: false,
    supports_timescale_marks: false,
  });
});

/**
 * GET /api/datafeed/symbols
 * 
 * Symbol info for TradingView.
 */
router.get('/symbols', (req: Request, res: Response) => {
  const symbol = (req.query.symbol as string) || 'BTC/USDT';
  
  const isForex = symbol.includes('EUR') || symbol.includes('GBP') || symbol.includes('JPY');
  const isCommodity = symbol.includes('XAU') || symbol.includes('PAXG');

  res.json({
    name: symbol,
    full_name: symbol,
    description: symbol,
    type: isCommodity ? 'commodity' : isForex ? 'forex' : 'crypto',
    session: '24x7',
    timezone: 'Etc/UTC',
    exchange: 'Binance',
    minmov: 1,
    pricescale: isForex ? 100000 : isCommodity ? 100 : (symbol.includes('BTC') ? 100 : 100),
    has_intraday: true,
    supported_resolutions: ['1', '5', '15', '60', '240', '1D'],
    volume_precision: 2,
    data_status: 'streaming',
  });
});

/**
 * GET /api/datafeed/time
 * 
 * Server time for TradingView.
 */
router.get('/time', (_req: Request, res: Response) => {
  res.send(Math.floor(Date.now() / 1000).toString());
});

/**
 * GET /api/datafeed/stats
 * 
 * Quick stats about stored data for a symbol.
 */
router.get('/stats', (req: Request, res: Response) => {
  const symbol = (req.query.symbol as string) || 'BTC/USDT';
  const resolution = (req.query.resolution as string) || '15';
  const timeframe = resolveTimeframe(resolution);

  const count = countCandles(symbol, timeframe);
  const latest = getLatestCandleTime(symbol, timeframe);
  const earliest = getEarliestCandleTime(symbol, timeframe);

  res.json({
    symbol,
    timeframe,
    count,
    earliest: earliest ? new Date(earliest * 1000).toISOString() : null,
    latest: latest ? new Date(latest * 1000).toISOString() : null,
  });
});

export default router;
