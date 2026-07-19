// ──────────────────────────────────────────────
// XOChat — Session token authentication middleware
// ──────────────────────────────────────────────
import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../config/supabase';
import { User } from '../types';
import { logger } from '../utils/logger';

// Extend Express Request to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Authenticates requests using the session token stored in an HttpOnly cookie.
 * The token is a UUID v4 generated at user creation.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionToken = req.cookies?.['__Host-xo_session'] || req.cookies?.['xo_session'];

    if (!sessionToken || typeof sessionToken !== 'string') {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (error || !user) {
      res.status(401).json({ success: false, error: 'Invalid session' });
      return;
    }

    req.user = user as User;
    next();
  } catch (err) {
    logger.error('authenticate', 'Authentication failed', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
