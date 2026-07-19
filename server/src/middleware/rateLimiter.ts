// ──────────────────────────────────────────────
// XOChat — Rate limiting middleware
// ──────────────────────────────────────────────
import rateLimit from 'express-rate-limit';

/** General API rate limit: 100 requests per minute */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

/** Strict rate limit for user creation: 5 per minute */
export const createUserLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many account creation attempts. Please wait.' },
});

/** Username check: 30 per minute (live checking) */
export const usernameCheckLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many availability checks. Please slow down.' },
});

/** Upload rate limit: 10 per minute */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many uploads. Please wait.' },
});

/** Message sending: 60 per minute */
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Sending messages too quickly. Please slow down.' },
});

/** Account recovery: 5 per 15 minutes per IP — prevent brute force */
export const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many recovery attempts. Please try again later.' },
});
