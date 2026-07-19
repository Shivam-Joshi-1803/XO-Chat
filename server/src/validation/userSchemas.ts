// ──────────────────────────────────────────────
// XOChat — User validation schemas
// ──────────────────────────────────────────────
import { z } from 'zod';

/** Reserved usernames that cannot be claimed */
export const RESERVED_USERNAMES = new Set([
  'admin', 'administrator', 'system', 'support', 'root',
  'api', 'xochat', 'xo', 'mod', 'moderator', 'staff',
  'help', 'info', 'contact', 'bot', 'null', 'undefined',
]);

/** Username rules: 3-20 chars, letters, numbers, _ and . only */
const usernameRegex = /^[a-zA-Z0-9_.]{3,20}$/;

const usernameField = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username must be at most 20 characters')
  .regex(usernameRegex, 'Username can only contain letters, numbers, underscores, and dots')
  .refine(
    (u) => !RESERVED_USERNAMES.has(u.toLowerCase()),
    'This username is reserved and cannot be used'
  );

export const checkUsernameSchema = z.object({ username: usernameField });

export const createUserSchema = z.object({
  username: usernameField,
  display_name: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be at most 50 characters')
    .optional(),
});

export const updateProfileSchema = z.object({
  display_name: z
    .string()
    .min(1, 'Display name cannot be empty')
    .max(50, 'Display name must be at most 50 characters')
    .optional(),
  bio: z.string().max(160, 'Bio must be at most 160 characters').optional().nullable(),
  avatar_url: z.string().url('Invalid avatar URL').optional().nullable(),
});

export const searchUserSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(20, 'Search query too long'),
});

export const blockUserSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
});

export const recoverAccountSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters'),
  recovery_key: z
    .string()
    .min(1, 'Recovery key is required')
    .max(30, 'Invalid recovery key'),
});
