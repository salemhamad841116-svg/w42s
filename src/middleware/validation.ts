import { Request, Response, NextFunction } from 'express';

export const validateSearchQuery = (req: Request, res: Response, next: NextFunction) => {
  let { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Search query "q" is required and must be a string' });
  }

  q = q.trim().replace(/<[^>]*>?/gm, ''); // Simple sanitize
  if (q.length < 1 || q.length > 200) {
    return res.status(400).json({ error: 'Search query must be between 1 and 200 characters' });
  }

  req.query.q = q; // update with sanitized
  next();
};

export const validateCoordinates = (req: Request, res: Response, next: NextFunction) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Valid lat and lng are required' });
  }

  if (lat < -90 || lat > 90) {
    return res.status(400).json({ error: 'Latitude must be between -90 and 90' });
  }

  if (lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'Longitude must be between -180 and 180' });
  }

  next();
};

export const validateDirectionsQuery = (req: Request, res: Response, next: NextFunction) => {
  const { from, to } = req.query;

  if (!from || typeof from !== 'string' || !to || typeof to !== 'string') {
    return res.status(400).json({ error: '"from" and "to" parameters are required' });
  }

  const parseCoords = (str: string) => {
    const parts = str.split(',');
    if (parts.length !== 2) return null;
    const lat = Number(parts[0]);
    const lng = Number(parts[1]);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return null;
    }
    return { lat, lng };
  };

  const fromCoords = parseCoords(from);
  const toCoords = parseCoords(to);

  if (!fromCoords || !toCoords) {
    return res.status(400).json({ error: 'Invalid coordinates format. Use lat,lng' });
  }

  next();
};