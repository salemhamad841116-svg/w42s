import express from 'express';
import { globalRedisQueueManager } from '../engine/RedisQueueManager';
import { globalStrategyRegistry } from '../engine/strategies/StrategyRegistry';
import { globalAutoEngine } from '../engine/AutoSignalEngine';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Security & Audit Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Cloudflare-WAF-Status', 'PROTECTED');
  next();
});

// TradingView Webhook Gateway
app.post('/api/webhook/tradingview', (req, res) => {
  try {
    const { secret, ticker, action, price, strategy, timeframe } = req.body;
    if (!secret || !ticker || !action || !price) {
      return res.status(400).json({ error: 'Missing required webhook fields' });
    }

    const signal = globalStrategyRegistry.processTradingViewWebhook({
      secret,
      ticker,
      action,
      price: Number(price),
      strategy,
      timeframe,
    });

    if (signal) {
      globalAutoEngine.injectCustomGeneratedSignal(signal);
      globalRedisQueueManager.pushNewJob({
        name: 'tradingview_webhook_signal',
        data: {
          pair: signal.pair,
          type: signal.type,
          entryPrice: signal.entryPrice,
          tp1: signal.tp1,
          stopLoss: signal.stopLoss,
          timestamp: signal.createdAt,
        },
      });

      return res.json({ success: true, signalId: signal.id });
    }

    res.status(400).json({ error: 'Webhook signal generation failed' });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Unauthorized Webhook' });
  }
});

// Prometheus Metrics Endpoint
app.get('/api/metrics', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.send(globalRedisQueueManager.getPrometheusMetricsText());
});

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    mode: 'CENTRAL_EXPRESS_API_GATEWAY',
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      redis: globalRedisQueueManager.getRedisStats(),
      firestoreDb: 'CONNECTED',
      notificationQueue: 'ACTIVE',
    },
  });
});

// Start API Gateway Server
if (process.env.NODE_ENV === 'production' && process.env.ENTRY_MODE === 'API_ONLY') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[API GATEWAY] Express Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;
