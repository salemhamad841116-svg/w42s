/**
 * Express Routes for OTC Scanner
 * مسارات الخادم لماسح OTC
 */

import express from 'express';
import { fetchOTCCandles, getSupportedPairs } from './otcDataProvider';
import { analyzeTechnicals } from './technicalIndicators';
import { globalAIAnalyzer } from './aiSignalAnalyzer';

export const otcScannerRoutes = {
  /**
   * Mounts the OTC scanner routes on the given Express app.
   * تسجيل مسارات ماسح OTC في تطبيق Express
   * 
   * @param app The Express application instance / تطبيق اكسبريس
   */
  mountRoutes(app: express.Express) {
    
    // POST /api/otc/scan - Runs a scan and AI analysis on a given pair
    app.post('/api/otc/scan', async (req, res) => {
      try {
        const { pair, timeframe = '1m' } = req.body;
        
        if (!pair) {
          return res.status(400).json({ success: false, error: 'Pair is required / الزوج مطلوب' });
        }
        
        const supportedPairs = getSupportedPairs();
        if (!supportedPairs.find(p => p.id === pair)) {
          return res.status(400).json({ success: false, error: 'Unsupported pair / الزوج غير مدعوم' });
        }

        // 1. Fetch data
        const dataResult = fetchOTCCandles(pair, 20); // Get enough for Bollinger Bands
        
        // 2. Technical Analysis
        const technicals = analyzeTechnicals(dataResult.candles);
        
        // 3. AI Analysis
        const signal = await globalAIAnalyzer.analyze(pair, dataResult.candles, technicals);
        
        res.json({
          success: true,
          signal,
          technicals,
          candles: dataResult.candles
        });
      } catch (error: any) {
        if (error.message && error.message.includes('already in progress')) {
          return res.status(409).json({ success: false, error: error.message });
        }
        if (error.message && error.message.includes('Cooldown')) {
          return res.status(429).json({ success: false, error: error.message });
        }
        console.error('Error during OTC scan:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error / خطأ داخلي في الخادم' });
      }
    });

    // GET /api/otc/pairs - Returns list of supported pairs
    app.get('/api/otc/pairs', (req, res) => {
      res.json({
        success: true,
        pairs: getSupportedPairs()
      });
    });

    // GET /api/otc/history - Returns analyzer history
    app.get('/api/otc/history', (req, res) => {
      res.json({
        success: true,
        history: globalAIAnalyzer.getHistory()
      });
    });

    // GET /api/otc/status - Returns analyzer status
    app.get('/api/otc/status', (req, res) => {
      res.json({
        success: true,
        status: globalAIAnalyzer.getStatus()
      });
    });
  }
};
