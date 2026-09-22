import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

export const cacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'GET') {
    return next();
  }

  const key = req.originalUrl;
  const entry = cache.get(key);
  const now = Date.now();

  if (entry && (now - entry.timestamp) < config.CACHE_TTL_MS) {
    return res.json(entry.data);
  }

  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (cache.size >= 500) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey) {
            cache.delete(oldestKey);
        }
      }
      cache.set(key, { data: body, timestamp: now });
    }
    return originalJson(body);
  };

  next();
};