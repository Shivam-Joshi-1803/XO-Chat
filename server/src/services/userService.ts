// ──────────────────────────────────────────────
// XOChat — User Service
// ──────────────────────────────────────────────
import crypto from 'crypto';
import { userRepository } from '../repositories/userRepository';
import { User, PublicUser, ApiResponse } from '../types';
import { normalizeUsername } from '../utils/sanitize';
import { logger } from '../utils/logger';
import { getSupabase } from '../config/supabase';
import { generateRecoveryKey, hashRecoveryKey, verifyRecoveryKey } from '../utils/recoveryKey';

export const userService = {
  async checkUsername(
    username: string
  ): Promise<ApiResponse<{ available: boolean; suggestions?: string[] }>> {
    const normalized = normalizeUsername(username);
    const exists = await userRepository.usernameExists(normalized);

    if (!exists) {
      return { success: true, data: { available: true } };
    }

    // Generate suggestions
    const suggestions = await generateSuggestions(normalized);
    return {
      success: true,
      data: { available: false, suggestions },
    };
  },

  async createUser(
    username: string,
    displayName?: string
  ): Promise<ApiResponse<User & { recovery_key: string }>> {
    const normalized = normalizeUsername(username);

    // Double-check uniqueness before insert
    const exists = await userRepository.usernameExists(normalized);
    if (exists) {
      return { success: false, error: 'Username is already taken' };
    }

    const user = await userRepository.create(
      normalized,
      displayName || normalized
    );

    if (!user) {
      return { success: false, error: 'Failed to create user. Username may already be taken.' };
    }

    // Create default settings
    await userRepository.createSettings(user.id);

    // Generate and store recovery key (hash only — never log or store plaintext)
    const recoveryKey = generateRecoveryKey();
    const keyHash = await hashRecoveryKey(recoveryKey);
    await userRepository.setRecoveryKeyHash(user.id, keyHash);

    logger.info('userService', `User created: @${normalized}`);

    // Return the plaintext key ONCE — it will never be accessible again
    return { success: true, data: { ...user, recovery_key: recoveryKey } };
  },

  async recoverAccount(
    username: string,
    recoveryKey: string
  ): Promise<ApiResponse<{ session_token: string }>> {
    const normalized = normalizeUsername(username);
    const user = await userRepository.findByUsername(normalized);

    // Generic error — never reveal which field is wrong
    const genericError = { success: false, error: 'Invalid username or recovery key' };

    if (!user) return genericError;
    if (!user.recovery_key_hash) return genericError;

    const valid = await verifyRecoveryKey(recoveryKey, user.recovery_key_hash);
    if (!valid) return genericError;

    // Rotate session token for security
    const newToken = await userRepository.rotateSession(user.id);
    if (!newToken) {
      return { success: false, error: 'Recovery failed. Please try again.' };
    }

    logger.info('userService', 'Account recovered via recovery key');
    return { success: true, data: { session_token: newToken } };
  },

  async deleteUser(userId: string): Promise<ApiResponse> {
    // Delete user's uploaded images from Supabase Storage
    try {
      const supabase = getSupabase();
      const { data: files } = await supabase.storage
        .from('chat-images')
        .list(userId);
      if (files && files.length > 0) {
        const paths = files.map((f) => `${userId}/${f.name}`);
        await supabase.storage.from('chat-images').remove(paths);
      }
    } catch (err) {
      logger.warn('userService', 'Failed to clean up storage during user deletion');
    }

    // Cascade delete handles conversations, messages, requests via DB constraints
    const success = await userRepository.deleteUser(userId);
    if (!success) {
      return { success: false, error: 'Failed to delete identity' };
    }

    logger.info('userService', 'User identity deleted');
    return { success: true, message: 'Identity permanently deleted' };
  },

  async updateProfile(
    userId: string,
    updates: Partial<Pick<User, 'display_name' | 'bio' | 'avatar_url'>>
  ): Promise<ApiResponse<PublicUser>> {
    const user = await userRepository.updateProfile(userId, updates);
    if (!user) {
      return { success: false, error: 'Failed to update profile' };
    }
    const { session_token, recovery_key_hash, ...publicUser } = user;
    return { success: true, data: publicUser };
  },

  async searchUsers(
    query: string,
    excludeId: string
  ): Promise<ApiResponse<PublicUser[]>> {
    const users = await userRepository.searchByUsername(query, excludeId);
    return { success: true, data: users };
  },

  async getProfile(userId: string): Promise<ApiResponse<PublicUser>> {
    const user = await userRepository.findPublicById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    return { success: true, data: user };
  },

  async blockUser(
    blockerId: string,
    blockedId: string
  ): Promise<ApiResponse> {
    if (blockerId === blockedId) {
      return { success: false, error: 'Cannot block yourself' };
    }

    const blocked = await userRepository.findById(blockedId);
    if (!blocked) {
      return { success: false, error: 'User not found' };
    }

    const { error } = await getSupabase()
      .from('blocked_users')
      .insert({ blocker_id: blockerId, blocked_id: blockedId });

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'User already blocked' };
      }
      logger.error('userService', 'blockUser failed', error);
      return { success: false, error: 'Failed to block user' };
    }
    return { success: true, message: 'User blocked' };
  },

  async unblockUser(
    blockerId: string,
    blockedId: string
  ): Promise<ApiResponse> {
    const { error } = await getSupabase()
      .from('blocked_users')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);

    if (error) {
      logger.error('userService', 'unblockUser failed', error);
      return { success: false, error: 'Failed to unblock user' };
    }
    return { success: true, message: 'User unblocked' };
  },

  async isBlocked(userA: string, userB: string): Promise<boolean> {
    const { data } = await getSupabase()
      .from('blocked_users')
      .select('id')
      .or(
        `and(blocker_id.eq.${userA},blocked_id.eq.${userB}),and(blocker_id.eq.${userB},blocked_id.eq.${userA})`
      )
      .limit(1);
    return !!(data && data.length > 0);
  },

  async getBlockedUsers(userId: string): Promise<ApiResponse<PublicUser[]>> {
    const blocked = await userRepository.getBlockedUsers(userId);
    // Enrich with public user info
    const enriched = await Promise.all(
      blocked.map(async (b) => {
        const pub = await userRepository.findPublicById(b.blocked_id);
        return pub;
      })
    );
    return { success: true, data: enriched.filter(Boolean) as PublicUser[] };
  },
};

async function generateSuggestions(base: string): Promise<string[]> {
  const candidates = [
    `${base}_1`,
    `${base}_${Math.floor(Math.random() * 99)}`,
    `${base}_dev`,
    `real${base}`,
    `${base}.x`,
  ];

  const available: string[] = [];
  for (const c of candidates) {
    if (c.length <= 20) {
      const exists = await userRepository.usernameExists(c);
      if (!exists) {
        available.push(c);
        if (available.length >= 3) break;
      }
    }
  }
  return available;
}
