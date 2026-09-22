import { Router } from 'express';
import { config } from '../config/index.js';
import { directionsLimiter } from '../middleware/rateLimiter.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { validateDirectionsQuery } from '../middleware/validation.js';

const router = Router();

router.get('/', directionsLimiter, cacheMiddleware, validateDirectionsQuery, async (req, res, next) => {
  try {
    const from = req.query.from as string;
    const to = req.query.to as string;

    const [fromLat, fromLng] = from.split(',').map(Number);
    const [toLat, toLng] = to.split(',').map(Number);

    // OSRM requires lon,lat order
    const coordinates = `${fromLng},${fromLat};${toLng},${toLat}`;
    const url = `${config.OSRM_URL}/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return res.status(404).json({ error: 'No route found' });
    }

    const route = data.routes[0];
    
    const geojsonCoords = route.geometry.coordinates;
    const pathCoordinates = geojsonCoords.map((coord: [number, number]) => [coord[1], coord[0]]);

    res.json({
      coordinates: pathCoordinates,
      distance: route.distance, // meters
      duration: route.duration  // seconds
    });
  } catch (error) {
    next(error);
  }
});

export { router as directionsRouter };