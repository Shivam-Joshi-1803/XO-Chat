// ──────────────────────────────────────────────
// XOChat — Chat request validation schemas
// ──────────────────────────────────────────────
import { z } from 'zod';

export const sendRequestSchema = z.object({
  username: z
    .string()
    .min(3, 'Username is required')
    .max(20, 'Invalid username'),
});

export const respondRequestSchema = z.object({
  request_id: z.string().uuid('Invalid request ID'),
});

export const cancelRequestSchema = z.object({
  request_id: z.string().uuid('Invalid request ID'),
});
