// ──────────────────────────────────────────────
// XOChat — Scheduled Jobs
// Starts all background jobs. Never blocks server startup.
// ──────────────────────────────────────────────
import { runCleanupInactiveUsers } from './cleanupInactiveUsers';
import { logger } from '../utils/logger';

const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export function startScheduledJobs(): void {
  // Run cleanup once immediately after startup (in background, non-blocking)
  setTimeout(() => {
    runCleanupInactiveUsers().catch((err) => {
      logger.error('jobs', 'Initial cleanup run failed');
    });
  }, 60 * 1000); // Wait 1 minute after startup before first run

  // Then run every 24 hours
  setInterval(() => {
    runCleanupInactiveUsers().catch((err) => {
      logger.error('jobs', 'Scheduled cleanup run failed');
    });
  }, CLEANUP_INTERVAL_MS);

  logger.info('jobs', 'Scheduled jobs started (cleanup every 24h)');
}
