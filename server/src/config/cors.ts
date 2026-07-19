// ──────────────────────────────────────────────
// XOChat — CORS configuration
// ──────────────────────────────────────────────
import { CorsOptions } from 'cors';
import { env } from './env';

export const corsOptions: CorsOptions = {
  origin: env.isDev
    ? [env.CLIENT_URL, 'http://localhost:3000']
    : [env.CLIENT_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
  maxAge: 86400,
};
