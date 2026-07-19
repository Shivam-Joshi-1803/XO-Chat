// ──────────────────────────────────────────────
// XOChat — Conversation Repository
// ──────────────────────────────────────────────
import { getSupabase } from '../config/supabase';
import { Conversation } from '../types';
import { logger } from '../utils/logger';

export const conversationRepository = {
  async create(userOne: string, userTwo: string): Promise<Conversation | null> {
    // Always store in consistent order to prevent duplicates
    const [first, second] = [userOne, userTwo].sort();
    const { data, error } = await getSupabase()
      .from('conversations')
      .insert({ user_one: first, user_two: second })
      .select('*')
      .single();
    if (error) {
      logger.error('conversationRepository', 'create failed', error);
      return null;
    }
    return data as Conversation;
  },

  async findById(id: string): Promise<Conversation | null> {
    const { data, error } = await getSupabase()
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') {
      logger.error('conversationRepository', 'findById failed', error);
    }
    return data as Conversation | null;
  },

  async findByUsers(userOne: string, userTwo: string): Promise<Conversation | null> {
    const [first, second] = [userOne, userTwo].sort();
    const { data, error } = await getSupabase()
      .from('conversations')
      .select('*')
      .eq('user_one', first)
      .eq('user_two', second)
      .single();
    if (error && error.code !== 'PGRST116') {
      logger.error('conversationRepository', 'findByUsers failed', error);
    }
    return data as Conversation | null;
  },

  async findAllForUser(userId: string): Promise<Conversation[]> {
    const { data, error } = await getSupabase()
      .from('conversations')
      .select('*')
      .or(`user_one.eq.${userId},user_two.eq.${userId}`)
      .not('hidden_by', 'cs', `{"${userId}"}`) // Exclude conversations hidden by this user
      .order('updated_at', { ascending: false });
    if (error) {
      logger.error('conversationRepository', 'findAllForUser failed', error);
      return [];
    }
    return (data || []) as Conversation[];
  },

  async deleteConversation(id: string): Promise<boolean> {
    const { error } = await getSupabase()
      .from('conversations')
      .delete()
      .eq('id', id);
    if (error) {
      logger.error('conversationRepository', 'deleteConversation failed', error);
      return false;
    }
    return true;
  },

  async togglePin(conversationId: string, userId: string, pin: boolean): Promise<boolean> {
    const conv = await this.findById(conversationId);
    if (!conv) return false;

    const currentPins: string[] = conv.pinned_by || [];
    const newPins = pin
      ? currentPins.includes(userId) ? currentPins : [...currentPins, userId]
      : currentPins.filter((id) => id !== userId);

    const { error } = await getSupabase()
      .from('conversations')
      .update({ pinned_by: newPins })
      .eq('id', conversationId);
    if (error) {
      logger.error('conversationRepository', 'togglePin failed', error);
      return false;
    }
    return true;
  },

  async toggleArchive(conversationId: string, userId: string, archive: boolean): Promise<boolean> {
    const conv = await this.findById(conversationId);
    if (!conv) return false;

    const current: string[] = conv.archived_by || [];
    const updated = archive
      ? current.includes(userId) ? current : [...current, userId]
      : current.filter((id) => id !== userId);

    const { error } = await getSupabase()
      .from('conversations')
      .update({ archived_by: updated })
      .eq('id', conversationId);
    if (error) {
      logger.error('conversationRepository', 'toggleArchive failed', error);
      return false;
    }
    return true;
  },

  /** Hide a conversation for this user (Close Chat). Messages remain. */
  async hideForUser(conversationId: string, userId: string): Promise<boolean> {
    const conv = await this.findById(conversationId);
    if (!conv) return false;

    const current: string[] = conv.hidden_by || [];
    if (current.includes(userId)) return true; // Already hidden

    const { error } = await getSupabase()
      .from('conversations')
      .update({ hidden_by: [...current, userId] })
      .eq('id', conversationId);
    if (error) {
      logger.error('conversationRepository', 'hideForUser failed', error);
      return false;
    }
    return true;
  },

  /** Unhide a conversation (when a new message arrives or user reopens it) */
  async unhideForUser(conversationId: string, userId: string): Promise<void> {
    const conv = await this.findById(conversationId);
    if (!conv) return;

    const updated = (conv.hidden_by || []).filter((id) => id !== userId);
    await getSupabase()
      .from('conversations')
      .update({ hidden_by: updated })
      .eq('id', conversationId);
  },

  async toggleMute(conversationId: string, userId: string, mute: boolean): Promise<boolean> {
    const conv = await this.findById(conversationId);
    if (!conv) return false;

    const current: string[] = conv.muted_by || [];
    const updated = mute
      ? current.includes(userId) ? current : [...current, userId]
      : current.filter((id) => id !== userId);

    const { error } = await getSupabase()
      .from('conversations')
      .update({ muted_by: updated })
      .eq('id', conversationId);
    if (error) {
      logger.error('conversationRepository', 'toggleMute failed', error);
      return false;
    }
    return true;
  },

  async touch(conversationId: string): Promise<void> {
    const { error } = await getSupabase()
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
    if (error) {
      logger.error('conversationRepository', 'touch failed', error);
    }
  },

  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const conv = await this.findById(conversationId);
    if (!conv) return false;
    return conv.user_one === userId || conv.user_two === userId;
  },
};
