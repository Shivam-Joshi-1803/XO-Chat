// ──────────────────────────────────────────────
// XOChat — Chat Request Repository
// ──────────────────────────────────────────────
import { getSupabase } from '../config/supabase';
import { ChatRequest, RequestStatus } from '../types';
import { logger } from '../utils/logger';

export const requestRepository = {
  async create(senderId: string, receiverId: string): Promise<ChatRequest | null> {
    const { data, error } = await getSupabase()
      .from('chat_requests')
      .insert({ sender_id: senderId, receiver_id: receiverId })
      .select('*')
      .single();
    if (error) {
      logger.error('requestRepository', 'create failed', error);
      return null;
    }
    return data as ChatRequest;
  },

  async findById(id: string): Promise<ChatRequest | null> {
    const { data, error } = await getSupabase()
      .from('chat_requests')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') {
      logger.error('requestRepository', 'findById failed', error);
    }
    return data as ChatRequest | null;
  },

  async findPendingBetween(userOne: string, userTwo: string): Promise<ChatRequest | null> {
    const { data, error } = await getSupabase()
      .from('chat_requests')
      .select('*')
      .eq('status', 'pending')
      .or(
        `and(sender_id.eq.${userOne},receiver_id.eq.${userTwo}),and(sender_id.eq.${userTwo},receiver_id.eq.${userOne})`
      )
      .single();
    if (error && error.code !== 'PGRST116') {
      logger.error('requestRepository', 'findPendingBetween failed', error);
    }
    return data as ChatRequest | null;
  },

  async updateStatus(id: string, status: RequestStatus): Promise<ChatRequest | null> {
    const { data, error } = await getSupabase()
      .from('chat_requests')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();
    if (error) {
      logger.error('requestRepository', 'updateStatus failed', error);
      return null;
    }
    return data as ChatRequest;
  },

  async deleteById(id: string): Promise<boolean> {
    const { error } = await getSupabase()
      .from('chat_requests')
      .delete()
      .eq('id', id);
    if (error) {
      logger.error('requestRepository', 'deleteById failed', error);
      return false;
    }
    return true;
  },

  async findReceivedPending(userId: string): Promise<ChatRequest[]> {
    const { data, error } = await getSupabase()
      .from('chat_requests')
      .select('*')
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) {
      logger.error('requestRepository', 'findReceivedPending failed', error);
      return [];
    }
    return (data || []) as ChatRequest[];
  },

  async findSentPending(userId: string): Promise<ChatRequest[]> {
    const { data, error } = await getSupabase()
      .from('chat_requests')
      .select('*')
      .eq('sender_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (error) {
      logger.error('requestRepository', 'findSentPending failed', error);
      return [];
    }
    return (data || []) as ChatRequest[];
  },

  async findAllForUser(userId: string): Promise<{
    received_pending: ChatRequest[];
    sent_pending: ChatRequest[];
    accepted: ChatRequest[];
    rejected_received: ChatRequest[];
  }> {
    const { data, error } = await getSupabase()
      .from('chat_requests')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('requestRepository', 'findAllForUser failed', error);
      return { received_pending: [], sent_pending: [], accepted: [], rejected_received: [] };
    }

    const all = (data || []) as ChatRequest[];
    return {
      received_pending: all.filter((r) => r.receiver_id === userId && r.status === 'pending'),
      sent_pending: all.filter((r) => r.sender_id === userId && r.status === 'pending'),
      accepted: all.filter((r) => r.status === 'accepted'),
      rejected_received: all.filter((r) => r.receiver_id === userId && r.status === 'rejected'),
    };
  },
};
