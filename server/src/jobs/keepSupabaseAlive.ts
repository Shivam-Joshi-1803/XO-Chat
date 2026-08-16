// ──────────────────────────────────────────────
// XOChat — Supabase Keep-Alive Job
// Runs periodically (every 3 days) to prevent Supabase Free Tier auto-pausing.
// ──────────────────────────────────────────────
import { getSupabase } from '../config/supabase';
import { logger } from '../utils/logger';

export async function runKeepSupabaseAlive(): Promise<void> {
  try {
    const supabase = getSupabase();
    // Lightweight HEAD query on users table to keep the Supabase database active
    const { error } = await supabase.from('users').select('id', { count: 'exact', head: true });
    if (error) {
      logger.error('jobs', 'Supabase keep-alive ping returned an error', error);
    } else {
      logger.info('jobs', 'Supabase keep-alive ping executed successfully');
    }
  } catch (err) {
    logger.error('jobs', 'Supabase keep-alive ping failed', err);
  }
}
