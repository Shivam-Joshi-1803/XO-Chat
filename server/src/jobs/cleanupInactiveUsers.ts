// ──────────────────────────────────────────────
// XOChat — Inactive User Cleanup Job
// Runs every 24 hours. Deletes ONLY users who satisfy ALL conditions:
//   • Inactive for more than 7 consecutive days
//   • No conversations
//   • No messages
//   • No pending or accepted requests
//   • No block relationships
//   • No uploaded images
// ──────────────────────────────────────────────
import { userRepository } from '../repositories/userRepository';
import { getSupabase } from '../config/supabase';
import { logger } from '../utils/logger';

const INACTIVE_DAYS = 7;

export async function runCleanupInactiveUsers(): Promise<void> {
  const startTime = Date.now();
  let deleted = 0;
  let errors = 0;

  try {
    logger.info('cleanupJob', `Starting inactive user cleanup (threshold: ${INACTIVE_DAYS} days)`);

    // Step 1: Find candidates (inactive + offline)
    const candidates = await userRepository.findInactiveUsersForCleanup(INACTIVE_DAYS);

    if (candidates.length === 0) {
      logger.info('cleanupJob', 'No candidates found for cleanup');
      return;
    }

    logger.info('cleanupJob', `Found ${candidates.length} candidates — checking eligibility...`);

    // Step 2: Verify each candidate satisfies ALL conditions before deleting
    for (const candidate of candidates) {
      try {
        const [hasConvs, hasMsgs, hasReqs, hasBlocks] = await Promise.all([
          userRepository.hasConversations(candidate.id),
          userRepository.hasMessages(candidate.id),
          userRepository.hasRequests(candidate.id),
          userRepository.hasBlockRelationships(candidate.id),
        ]);

        // Check for uploaded images in storage
        let hasImages = false;
        try {
          const supabase = getSupabase();
          const { data: files } = await supabase.storage
            .from('chat-images')
            .list(candidate.id, { limit: 1 });
          hasImages = !!(files && files.length > 0);
        } catch {
          // Storage check failure — be conservative and skip
          hasImages = true;
        }

        // Skip if ANY condition fails
        if (hasConvs || hasMsgs || hasReqs || hasBlocks || hasImages) {
          continue;
        }

        // All conditions satisfied — safe to delete
        const success = await userRepository.deleteUser(candidate.id);
        if (success) {
          deleted++;
        } else {
          errors++;
        }
      } catch (err) {
        errors++;
        // Do NOT log username or any user-identifying details
        logger.error('cleanupJob', 'Error processing cleanup candidate');
      }
    }
  } catch (err) {
    logger.error('cleanupJob', 'Cleanup job failed with unexpected error');
    errors++;
  } finally {
    const elapsed = Date.now() - startTime;
    logger.info(
      'cleanupJob',
      `Cleanup complete — deleted: ${deleted}, errors: ${errors}, elapsed: ${elapsed}ms`
    );
  }
}
