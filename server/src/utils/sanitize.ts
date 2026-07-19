// ──────────────────────────────────────────────
// XOChat — Input sanitization utilities
// ──────────────────────────────────────────────

/**
 * Strips HTML tags and dangerous characters from a string.
 * This is a defense-in-depth measure — React escapes on the frontend,
 * and parameterized queries protect the database. This cleans message content.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') // Strip angle brackets
    .replace(/javascript:/gi, '') // Strip javascript: URIs
    .replace(/on\w+=/gi, '') // Strip inline event handlers
    .trim();
}

/**
 * Normalizes and lowercases a username for storage.
 */
export function normalizeUsername(username: string): string {
  return username.toLowerCase().trim();
}

/**
 * Validates that a filename has an allowed image extension.
 */
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

export function isAllowedImageExtension(filename: string): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return ALLOWED_IMAGE_EXTENSIONS.has(ext);
}

/**
 * Validates magic bytes of common image formats.
 */
export function validateImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;

  // GIF: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;

  // WebP: 52 49 46 46 ... 57 45 42 50
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) return true;

  return false;
}
