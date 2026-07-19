// ──────────────────────────────────────────────
// XOChat — Global error handler
// ──────────────────────────────────────────────
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Global error handler. Returns generic messages to clients
 * while logging detailed error information server-side.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('errorHandler', 'Unhandled error', err);

  // Never expose internal error details to clients
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred. Please try again.',
  });
}
