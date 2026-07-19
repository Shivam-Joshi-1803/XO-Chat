// ──────────────────────────────────────────────
// XOChat — Security headers middleware
// ──────────────────────────────────────────────
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Sets secure HTTP headers beyond what Helmet provides.
 * Implements CSP, X-Frame-Options, Permissions-Policy, etc.
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      `connect-src 'self' ${env.CLIENT_URL} ${env.SUPABASE_URL}`,
      "img-src 'self' data: blob: https://*.supabase.co",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",  // Required for inline styles from UI frameworks
      "font-src 'self' https://fonts.gstatic.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'DENY');

  // MIME sniffing prevention
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Disable unused browser features
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Cache control for API responses
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');

  next();
}
