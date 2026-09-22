import { Router, type Request, type Response } from 'express';
import { aiSignalLogs, clients, type AISignal } from '../aiExecutionService.js';

const router = Router();

/**
 * GET /api/ai/logs
 * Returns the history of AI decisions.
 */
router.get('/logs', (_req: Request, res: Response) => {
  res.json(aiSignalLogs);
});

/**
 * GET /api/ai/stream
 * Server-Sent Events (SSE) endpoint to stream AI signals in real-time to the browser.
 */
router.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send an initial heartbeat
  res.write(': heartbeat\n\n');

  const clientCallback = (signal: AISignal) => {
    res.write(`data: ${JSON.stringify(signal)}\n\n`);
  };

  clients.add(clientCallback);

  req.on('close', () => {
    clients.delete(clientCallback);
  });
});

export default router;
