import { Router } from 'express';
import { config } from '../config/index.js';
import { searchLimiter } from '../middleware/rateLimiter.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { validateSearchQuery, validateCoordinates } from '../middleware/validation.js';

const router = Router();

const USER_AGENT = 'Kharita/1.0';

router.get('/search', searchLimiter, cacheMiddleware, validateSearchQuery, async (req, res, next) => {
  try {
    const q = req.query.q as string;
    const lang = (req.query.lang as string) || 'en';
    const limit = Math.min(Number(req.query.limit) || 5, 10);

    const url = new URL(`${config.NOMINATIM_URL}/search`);
    url.searchParams.append('q', q);
    url.searchParams.append('format', 'json');
    url.searchParams.append('addressdetails', '1');
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('accept-language', lang);

    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    const transformed = data.map((item: any) => ({
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      address: item.address,
      lat: Number(item.lat),
      lng: Number(item.lon),
      type: item.type,
      importance: item.importance
    }));

    res.json(transformed);
  } catch (error) {
    next(error);
  }
});

router.get('/reverse', searchLimiter, cacheMiddleware, validateCoordinates, async (req, res, next) => {
  try {
    const lat = req.query.lat as string;
    const lng = req.query.lng as string;
    const lang = (req.query.lang as string) || 'en';

    const url = new URL(`${config.NOMINATIM_URL}/reverse`);
    url.searchParams.append('lat', lat);
    url.searchParams.append('lon', lng);
    url.searchParams.append('format', 'json');
    url.searchParams.append('addressdetails', '1');
    url.searchParams.append('accept-language', lang);

    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': USER_AGENT }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      return res.status(404).json({ error: 'No location found' });
    }

    const transformed = {
      name: data.name || data.display_name.split(',')[0],
      displayName: data.display_name,
      address: data.address,
      lat: Number(data.lat),
      lng: Number(data.lon),
      type: data.type
    };

    res.json(transformed);
  } catch (error) {
    next(error);
  }
});

export { router as searchRouter };