// ──────────────────────────────────────────────
// XOChat — Constants
// ──────────────────────────────────────────────

export const API_URL = typeof window !== 'undefined'
  ? '/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,20}$/;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
export const MESSAGES_PER_PAGE = 30;
