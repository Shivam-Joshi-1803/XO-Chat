// ──────────────────────────────────────────────
// XOChat — Message validation schemas
// ──────────────────────────────────────────────
import { z } from 'zod';

export const sendMessageSchema = z.object({
  conversation_id: z.string().uuid('Invalid conversation ID'),
  type: z.enum(['text', 'image'], { errorMap: () => ({ message: 'Type must be text or image' }) }),
  content: z
    .string()
    .max(2000, 'Message too long (max 2000 characters)')
    .optional()
    .nullable(),
  image_url: z
    .string()
    .url('Invalid image URL')
    .optional()
    .nullable(),
  reply_to: z
    .string()
    .uuid('Invalid reply message ID')
    .optional()
    .nullable(),
}).refine(
  (data) => {
    if (data.type === 'text') return !!data.content?.trim();
    if (data.type === 'image') return !!data.image_url;
    return false;
  },
  { message: 'Text messages require content; image messages require image_url' }
);

export const getMessagesSchema = z.object({
  conversationId: z.string().uuid('Invalid conversation ID'),
});

export const deleteMessageSchema = z.object({
  id: z.string().uuid('Invalid message ID'),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(30),
});
