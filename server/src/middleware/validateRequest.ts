// ──────────────────────────────────────────────
// XOChat — Zod-based request validation middleware
// ──────────────────────────────────────────────
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Creates middleware that validates req.body against a Zod schema.
 * On failure, returns 400 with structured error messages.
 */
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: messages,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Validates query parameters.
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: messages,
        });
        return;
      }
      next(error);
    }
  };
}

/**
 * Validates route parameters.
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        res.status(400).json({
          success: false,
          error: 'Invalid parameters',
          details: messages,
        });
        return;
      }
      next(error);
    }
  };
}
