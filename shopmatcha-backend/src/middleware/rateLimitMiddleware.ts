import rateLimit from 'express-rate-limit';
import { AUTH_CONFIG } from '../config/auth.config';

/**
 * Rate limiting for authentication endpoints
 * Limits: 5 requests per 15 minutes per IP
 */
export const authRateLimit = rateLimit({
  windowMs: AUTH_CONFIG.RATE_LIMIT_WINDOW_MS,
  max: AUTH_CONFIG.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiting
 * Limits: 100 requests per 15 minutes per IP
 */
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
