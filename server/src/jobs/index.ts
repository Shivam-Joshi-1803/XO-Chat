// ──────────────────────────────────────────────
// XOChat — Scheduled Jobs
// Starts all background jobs. Never blocks server startup.
// ──────────────────────────────────────────────
import { runCleanupInactiveUsers } from './cleanupInactiveUsers';
import { runKeepSupabaseAlive } from './keepSupabaseAlive';
import { runKeepRenderAlive } from './keepRenderAlive';
import { logger } from '../utils/logger';

const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const KEEP_ALIVE_INTERVAL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
const RENDER_KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export function startScheduledJobs(): void {
  // Wait 1 minute after startup before first run
  setTimeout(() => {
    runKeepRenderAlive().catch(() => {
      logger.error('jobs', 'Initial Render keep-alive failed');
    });
    runKeepSupabaseAlive().catch(() => {
      logger.error('jobs', 'Initial Supabase keep-alive failed');
    });
    runCleanupInactiveUsers().catch(() => {
      logger.error('jobs', 'Initial cleanup run failed');
    });
  }, 60 * 1000);

  // Scheduled Render backend self-ping every 10 minutes (prevents 15-min sleep on Render)
  setInterval(() => {
    runKeepRenderAlive().catch(() => {
      logger.error('jobs', 'Scheduled Render keep-alive failed');
    });
  }, RENDER_KEEP_ALIVE_INTERVAL_MS);

  // Scheduled cleanup every 24 hours
  setInterval(() => {
    runCleanupInactiveUsers().catch(() => {
      logger.error('jobs', 'Scheduled cleanup run failed');
    });
  }, CLEANUP_INTERVAL_MS);

  // Scheduled Supabase keep-alive every 3 days
  setInterval(() => {
    runKeepSupabaseAlive().catch(() => {
      logger.error('jobs', 'Scheduled Supabase keep-alive failed');
    });
  }, KEEP_ALIVE_INTERVAL_MS);

  logger.info('jobs', 'Scheduled jobs started (Render: 10m, cleanup: 24h, Supabase: 3d)');
}
