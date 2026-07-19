// ──────────────────────────────────────────────
// XOChat — Message Repository
// ──────────────────────────────────────────────
import { getSupabase } from '../config/supabase';
import { Message } from '../types';
import { logger } from '../utils/logger';

export const messageRepository = {
  async create(params: {
    conversation_id: string;
    sender_id: string;
    type: 'text' | 'image';
    content?: string | null;
    image_url?: string | null;
    reply_to?: string | null;
  }): Promise<Message | null> {
    const { data, error } = await getSupabase()
      .from('messages')
      .insert(params)
      .select('*')
      .single();
    if (error) {
      logger.error('messageRepository', 'create failed', error);
      return null;
    }
    return data as Message;
  },

  async findByConversation(
    conversationId: string,
    page: number = 1,
    limit: number = 30
  ): Promise<{ messages: Message[]; total: number }> {
    const offset = (page - 1) * limit;

    // Fetch messages and exact count in a single query
    const { data, count, error } = await getSupabase()
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error('messageRepository', 'findByConversation failed', error);
      return { messages: [], total: 0 };
    }
    return {
      messages: ((data || []) as Message[]).reverse(),
      total: count || 0,
    };
  },

  async findById(id: string): Promise<Message | null> {
    const { data, error } = await getSupabase()
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') {
      logger.error('messageRepository', 'findById failed', error);
    }
    return data as Message | null;
  },

  async deleteMessage(id: string): Promise<boolean> {
    const { error } = await getSupabase()
      .from('messages')
      .delete()
      .eq('id', id);
    if (error) {
      logger.error('messageRepository', 'deleteMessage failed', error);
      return false;
    }
    return true;
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const { error } = await getSupabase()
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false);
    if (error) {
      logger.error('messageRepository', 'markAsRead failed', error);
    }
  },

  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    const { count, error } = await getSupabase()
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false);
    if (error) {
      logger.error('messageRepository', 'getUnreadCount failed', error);
      return 0;
    }
    return count || 0;
  },

  async getLastMessage(conversationId: string): Promise<Message | null> {
    const { data, error } = await getSupabase()
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') {
      logger.error('messageRepository', 'getLastMessage failed', error);
    }
    return data as Message | null;
  },

  async searchInConversation(
    conversationId: string,
    query: string
  ): Promise<Message[]> {
    const { data, error } = await getSupabase()
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      logger.error('messageRepository', 'searchInConversation failed', error);
      return [];
    }
    return (data || []) as Message[];
  },
};
