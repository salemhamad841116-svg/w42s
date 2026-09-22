import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

const message = {
  error: 'Too many requests, please try again later. (تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً)'
};

export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.SEARCH_RATE_LIMIT,
  message,
});

export const directionsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.DIRECTIONS_RATE_LIMIT,
  message,
});