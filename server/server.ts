import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import datafeedRoutes from './routes/datafeed.js';
import adminRoutes from './routes/admin.js';
import aiEngineRoutes from './routes/aiEngine.js';
import useApiRoutes from './use/routes/useApi.js';
import useAdminRoutes from './use/routes/useAdmin.js';
import brokerRoutes from './routes/broker.js';
import { startIncrementalSync } from './syncScheduler.js';
import { startAIEngine } from './aiExecutionService.js';
import { initializeKeyManager } from './keyManager.js';
import { initializeUSEDatabase } from './use/useDatabase.js';
import { startDailyDigestJob } from './use/dailyDigestJob.js';
import { initializeVersionManager, getVersionManifest } from './versionManager.js';

const app = express();
const PORT = parseInt(process.env.PORT || '4001');

/* ─── Middleware ─── */
app.use(cors());
app.use(express.json());

/* ─── Health Check & Version Manifest (Zero-Reinstall Updates) ─── */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'forex-signals-data-server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/version', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.json(getVersionManifest());
});

/* ─── API Routes ─── */
app.use('/api/datafeed', datafeedRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/broker', brokerRoutes);
app.use('/api/ai', aiEngineRoutes);
app.use('/api/use', useApiRoutes);
app.use('/api/use/admin', useAdminRoutes);

/* ─── Static Files & SPA Routing for Production / Cloud Run ─── */
const DIST_PATH = path.resolve(import.meta.dirname, '..', 'dist');

if (fs.existsSync(DIST_PATH)) {
  console.log(`📦 Serving static frontend from: ${DIST_PATH}`);
  app.use(express.static(DIST_PATH));

  // Serve admin portal
  app.get('/admin', (_req, res) => {
    res.sendFile(path.join(DIST_PATH, 'admin.html'));
  });
  app.get('/admin.html', (_req, res) => {
    res.sendFile(path.join(DIST_PATH, 'admin.html'));
  });

  // Fallback to SPA index.html for client-side routing (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
}

/* ─── Start Server ─── */
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║  📊 Historical Data Server                       ║
║  🌐 http://localhost:${PORT}                        ║
║  📡 /api/datafeed/history — Public Chart          ║
║  🔒 /api/admin/historical-export — AI Export      ║
║  🧠 /api/use/* — Universal Strategy Engine        ║
║  💾 SQLite: data/candles.db                       ║
╚═══════════════════════════════════════════════════╝
  `);

  // Initialize USE database tables
  initializeUSEDatabase();
  initializeVersionManager();
  startDailyDigestJob();

  // Start incremental sync scheduler
  startIncrementalSync();
  
  // Load API keys securely into RAM
  initializeKeyManager();
  
  // Start AI Engine (polls news every 30 seconds)
  startAIEngine(30_000);

  console.log('💡 Tip: Run initial sync with:');
  console.log('   curl -X POST http://localhost:4001/api/admin/sync-initial');
  console.log('');
});

export default app;
