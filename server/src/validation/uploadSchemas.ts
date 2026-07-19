// ──────────────────────────────────────────────
// XOChat — Upload validation schemas
// ──────────────────────────────────────────────
import { z } from 'zod';

export const uploadImageSchema = z.object({
  conversation_id: z.string().uuid('Invalid conversation ID'),
});
