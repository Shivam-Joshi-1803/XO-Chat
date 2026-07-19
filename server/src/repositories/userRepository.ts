// ──────────────────────────────────────────────
// XOChat — User Repository
// ──────────────────────────────────────────────
import { getSupabase } from '../config/supabase';
import { User, PublicUser } from '../types';
import { logger } from '../utils/logger';

const PUBLIC_USER_FIELDS = 'id, username, display_name, avatar_url, bio, online, last_seen, last_active';

export const userRepository = {
  async findByUsername(username: string): Promise<User | null> {
    const { data, error } = await getSupabase()
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();
    if (error && error.code !== 'PGRST116') {
      logger.error('userRepository', 'findByUsername failed', error);
    }
    return data as User | null;
  },

  async findById(id: string): Promise<User | null> {
    const { data, error } = await getSupabase()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') {
      logger.error('userRepository', 'findById failed', error);
    }
    return data as User | null;
  },

  async findPublicById(id: string): Promise<PublicUser | null> {
    const { data, error } = await getSupabase()
      .from('users')
      .select(PUBLIC_USER_FIELDS)
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') {
      logger.error('userRepository', 'findPublicById failed', error);
    }
    return data as PublicUser | null;
  },

  async findBySessionToken(token: string): Promise<User | null> {
    const { data, error } = await getSupabase()
      .from('users')
      .select('*')
      .eq('session_token', token)
      .single();
    if (error && error.code !== 'PGRST116') {
      logger.error('userRepository', 'findBySessionToken failed', error);
    }
    return data as User | null;
  },

  async create(username: string, displayName: string): Promise<User | null> {
    const { data, error } = await getSupabase()
      .from('users')
      .insert({
        username: username.toLowerCase(),
        display_name: displayName,
        last_active: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) {
      logger.error('userRepository', 'create failed', error);
      return null;
    }
    return data as User;
  },

  async updateProfile(
    userId: string,
    updates: Partial<Pick<User, 'display_name' | 'bio' | 'avatar_url'>>
  ): Promise<User | null> {
    const { data, error } = await getSupabase()
      .from('users')
      .update({ ...updates, last_active: new Date().toISOString() })
      .eq('id', userId)
      .select('*')
      .single();
    if (error) {
      logger.error('userRepository', 'updateProfile failed', error);
      return null;
    }
    return data as User;
  },

  async setOnline(userId: string, online: boolean): Promise<void> {
    const updates: Record<string, unknown> = { online };
    if (!online) {
      updates.last_seen = new Date().toISOString();
    }
    const { error } = await getSupabase()
      .from('users')
      .update(updates)
      .eq('id', userId);
    if (error) {
      logger.error('userRepository', 'setOnline failed');
    }
  },

  async updateLastActive(userId: string): Promise<void> {
    const { error } = await getSupabase()
      .from('users')
      .update({ last_active: new Date().toISOString() })
      .eq('id', userId);
    if (error) {
      logger.error('userRepository', 'updateLastActive failed');
    }
  },

  async setRecoveryKeyHash(userId: string, hash: string): Promise<boolean> {
    const { error } = await getSupabase()
      .from('users')
      .update({ recovery_key_hash: hash })
      .eq('id', userId);
    if (error) {
      logger.error('userRepository', 'setRecoveryKeyHash failed', error);
      return false;
    }
    return true;
  },

  async rotateSession(userId: string): Promise<string | null> {
    // Generate a new UUID session token via Supabase
    const { data, error } = await getSupabase()
      .from('users')
      .update({
        session_token: crypto.randomUUID(),
        last_active: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('session_token')
      .single();
    if (error) {
      logger.error('userRepository', 'rotateSession failed', error);
      return null;
    }
    return (data as { session_token: string }).session_token;
  },

  async deleteUser(userId: string): Promise<boolean> {
    const { error } = await getSupabase()
      .from('users')
      .delete()
      .eq('id', userId);
    if (error) {
      logger.error('userRepository', 'deleteUser failed', error);
      return false;
    }
    return true;
  },

  async searchByUsername(query: string, excludeId: string): Promise<PublicUser[]> {
    const { data, error } = await getSupabase()
      .from('users')
      .select(PUBLIC_USER_FIELDS)
      .ilike('username', `%${query.toLowerCase()}%`)
      .neq('id', excludeId)
      .limit(10);
    if (error) {
      logger.error('userRepository', 'searchByUsername failed', error);
      return [];
    }
    return (data || []) as PublicUser[];
  },

  async usernameExists(username: string): Promise<boolean> {
    const { data } = await getSupabase()
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();
    return !!data;
  },

  async createSettings(userId: string): Promise<void> {
    const { error } = await getSupabase()
      .from('user_settings')
      .insert({ user_id: userId });
    if (error) {
      logger.error('userRepository', 'createSettings failed', error);
    }
  },

  /**
   * Finds users eligible for cleanup:
   * - Inactive for more than `days` consecutive days
   * - No conversations, messages, pending/accepted requests, blocked users
   */
  async findInactiveUsersForCleanup(days: number): Promise<{ id: string; username: string }[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const { data, error } = await getSupabase()
      .from('users')
      .select('id, username')
      .lt('last_active', cutoff.toISOString())
      .eq('online', false);

    if (error) {
      logger.error('userRepository', 'findInactiveUsersForCleanup failed', error);
      return [];
    }

    return (data || []) as { id: string; username: string }[];
  },

  /** Check if user has any conversations */
  async hasConversations(userId: string): Promise<boolean> {
    const { count } = await getSupabase()
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .or(`user_one.eq.${userId},user_two.eq.${userId}`);
    return (count ?? 0) > 0;
  },

  /** Check if user has any messages */
  async hasMessages(userId: string): Promise<boolean> {
    const { count } = await getSupabase()
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_id', userId);
    return (count ?? 0) > 0;
  },

  /** Check if user has any pending or accepted requests */
  async hasRequests(userId: string): Promise<boolean> {
    const { count } = await getSupabase()
      .from('chat_requests')
      .select('id', { count: 'exact', head: true })
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .in('status', ['pending', 'accepted']);
    return (count ?? 0) > 0;
  },

  /** Check if user has blocked or been blocked by anyone */
  async hasBlockRelationships(userId: string): Promise<boolean> {
    const { count } = await getSupabase()
      .from('blocked_users')
      .select('id', { count: 'exact', head: true })
      .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);
    return (count ?? 0) > 0;
  },

  /** Get blocked users for a user (for requests page) */
  async getBlockedUsers(userId: string): Promise<Array<{ id: string; blocked_id: string; created_at: string; blocked_user?: PublicUser }>> {
    const { data, error } = await getSupabase()
      .from('blocked_users')
      .select('id, blocked_id, created_at')
      .eq('blocker_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      logger.error('userRepository', 'getBlockedUsers failed', error);
      return [];
    }
    return (data || []) as Array<{ id: string; blocked_id: string; created_at: string }>;
  },
};
