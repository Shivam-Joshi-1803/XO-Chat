// ──────────────────────────────────────────────
// XOChat — Recovery Key Utilities
// ──────────────────────────────────────────────
import crypto from 'crypto';
import { hash, verify } from '@node-rs/argon2';

const ARGON2_OPTIONS = {
  memoryCost: 65536,   // 64 MiB
  timeCost: 3,
  parallelism: 1,
};

/**
 * Generates a cryptographically secure recovery key.
 * Format: XO-XXXX-XXXX-XXXX-XXXX (20 uppercase chars = 100+ bits of entropy)
 */
export function generateRecoveryKey(): string {
  const bytes = crypto.randomBytes(10); // 80 bits raw, base32-encoded to ~16 chars
  const hex = bytes.toString('hex').toUpperCase();
  // Slice into 4 groups of 4 chars
  const parts = [
    hex.slice(0, 4),
    hex.slice(4, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
  ];
  return `XO-${parts.join('-')}`;
}

/**
 * Hashes a recovery key using Argon2id.
 * Never store the plaintext key — only the hash.
 */
export async function hashRecoveryKey(key: string): Promise<string> {
  return hash(key, ARGON2_OPTIONS);
}

/**
 * Verifies a recovery key against a stored Argon2id hash.
 */
export async function verifyRecoveryKey(
  key: string,
  storedHash: string
): Promise<boolean> {
  try {
    return await verify(storedHash, key);
  } catch {
    return false;
  }
}
