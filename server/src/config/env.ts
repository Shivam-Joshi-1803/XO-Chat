// ──────────────────────────────────────────────
// XOChat — Environment variable loader & validation
// ──────────────────────────────────────────────
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function getSecret(envKey: string, fileFallback: string): string {
  const envVal = process.env[envKey];
  if (envVal) return envVal;

  const filePath = path.resolve(fileFallback);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8').trim();
  }

  // TODO(security): In production, secrets MUST come from env vars or a secret manager.
  // This ephemeral fallback is only safe for single-instance local dev.
  console.warn(
    `[SECURITY WARNING] ${envKey} not set. Generating ephemeral secret. Instance-isolated — not suitable for production!`
  );
  return crypto.randomBytes(32).toString('hex');
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  SUPABASE_URL: requireEnv('SUPABASE_URL'),
  SUPABASE_ANON_KEY: requireEnv('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),

  COOKIE_SECRET: getSecret('COOKIE_SECRET', './cookie_secret.txt'),

  get isDev(): boolean {
    return this.NODE_ENV === 'development';
  },
  get isProd(): boolean {
    return this.NODE_ENV === 'production';
  },
};
