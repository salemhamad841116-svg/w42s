export const config = {
  PORT: process.env.PORT || 3001,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  NOMINATIM_URL: process.env.NOMINATIM_URL || 'https://nominatim.openstreetmap.org',
  OSRM_URL: process.env.OSRM_URL || 'https://router.project-osrm.org',
  CACHE_TTL_MS: Number(process.env.CACHE_TTL_MS) || 300000,
  SEARCH_RATE_LIMIT: Number(process.env.SEARCH_RATE_LIMIT) || 30,
  DIRECTIONS_RATE_LIMIT: Number(process.env.DIRECTIONS_RATE_LIMIT) || 20,
};