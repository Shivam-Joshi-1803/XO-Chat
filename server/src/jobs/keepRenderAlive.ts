// ──────────────────────────────────────────────
// XOChat — Render Backend Keep-Alive Job
// Self-pings /api/health every 10 minutes to prevent Render Free Tier sleeping (15-min timeout)
// ──────────────────────────────────────────────
import { logger } from '../utils/logger';

export async function runKeepRenderAlive(): Promise<void> {
  const serverUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;
  if (!serverUrl) {
    // RENDER_EXTERNAL_URL is automatically provided by Render in production
    return;
  }

  try {
    const healthUrl = `${serverUrl.replace(/\/$/, '')}/api/health`;
    const response = await fetch(healthUrl);
    if (response.ok) {
      logger.info('jobs', 'Render backend self-ping successful');
    } else {
      logger.error('jobs', `Render backend self-ping status: ${response.status}`);
    }
  } catch (err) {
    logger.error('jobs', 'Render backend self-ping failed', err);
  }
}
