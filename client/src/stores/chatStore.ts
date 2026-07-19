'use client';
// ──────────────────────────────────────────────
// XOChat — Chat Store (Zustand)
// ──────────────────────────────────────────────
import { create } from 'zustand';
import type { Conversation, Message, ChatRequest, AllRequests } from '@/types';
import { api } from '@/lib/api';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  pendingRequests: { received: ChatRequest[]; sent: ChatRequest[] };
  allRequests: AllRequests | null;
  typingUsers: Record<string, boolean>;
  onlineUsers: Set<string>;

  setConversations: (convs: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  prependMessages: (conversationId: string, messages: Message[]) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  setPendingRequests: (requests: { received: ChatRequest[]; sent: ChatRequest[] }) => void;
  setAllRequests: (requests: AllRequests) => void;
  removeRequest: (requestId: string) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  setUserOnline: (userId: string, online: boolean) => void;
  updateConversationLastMessage: (conversationId: string, message: Message) => void;
  updateUnreadCount: (conversationId: string, count: number) => void;
  removeConversation: (conversationId: string) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;

  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string, page?: number) => Promise<boolean>;
  fetchRequests: () => Promise<void>;
  fetchAllRequests: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  pendingRequests: { received: [], sent: [] },
  allRequests: null,
  typingUsers: {},
  onlineUsers: new Set(),

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addMessage: (conversationId, message) =>
    set((state) => {
      const existing = state.messages[conversationId] || [];
      // Avoid duplicates
      if (existing.find((m) => m.id === message.id)) return state;
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existing, message],
        },
      };
    }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [conversationId]: messages },
    })),

  prependMessages: (conversationId, messages) =>
    set((state) => {
      const existing = state.messages[conversationId] || [];
      // Deduplicate by id
      const existingIds = new Set(existing.map((m) => m.id));
      const newMessages = messages.filter((m) => !existingIds.has(m.id));
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...newMessages, ...existing],
        },
      };
    }),

  removeMessage: (conversationId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).filter(
          (m) => m.id !== messageId
        ),
      },
    })),

  setPendingRequests: (requests) => set({ pendingRequests: requests }),

  setAllRequests: (requests) => set({ allRequests: requests }),

  removeRequest: (requestId) =>
    set((state) => ({
      pendingRequests: {
        received: state.pendingRequests.received.filter((r) => r.id !== requestId),
        sent: state.pendingRequests.sent.filter((r) => r.id !== requestId),
      },
      allRequests: state.allRequests
        ? {
            received_pending: state.allRequests.received_pending.filter((r) => r.id !== requestId),
            sent_pending: state.allRequests.sent_pending.filter((r) => r.id !== requestId),
            accepted: state.allRequests.accepted.filter((r) => r.id !== requestId),
            rejected_received: state.allRequests.rejected_received.filter((r) => r.id !== requestId),
          }
        : null,
    })),

  setTyping: (conversationId, isTyping) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [conversationId]: isTyping },
    })),

  setUserOnline: (userId, online) =>
    set((state) => {
      const newSet = new Set(state.onlineUsers);
      if (online) newSet.add(userId);
      else newSet.delete(userId);

      // Update conversations' other_user online status
      const updatedConvs = state.conversations.map((c) => {
        if (c.other_user && c.other_user.id === userId) {
          return { ...c, other_user: { ...c.other_user, online } };
        }
        return c;
      });

      return { onlineUsers: newSet, conversations: updatedConvs };
    }),

  updateConversationLastMessage: (conversationId, message) =>
    set((state) => {
      const userId = null; // Sorted server-side; client just bumps timestamp
      return {
        conversations: state.conversations
          .map((c) => (c.id === conversationId ? { ...c, last_message: message, updated_at: message.created_at } : c))
          .sort((a, b) => {
            const aP = (a.pinned_by?.length ?? 0) > 0;
            const bP = (b.pinned_by?.length ?? 0) > 0;
            if (aP && !bP) return -1;
            if (!aP && bP) return 1;
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          }),
      };
    }),

  updateUnreadCount: (conversationId, count) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unread_count: count } : c
      ),
    })),

  removeConversation: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== conversationId),
      activeConversationId:
        state.activeConversationId === conversationId ? null : state.activeConversationId,
    })),

  updateConversation: (conversationId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, ...updates } : c
      ),
    })),

  fetchConversations: async () => {
    const res = await api.getConversations();
    if (res.success && res.data) {
      set({ conversations: res.data });
    }
  },

  fetchMessages: async (conversationId, page = 1) => {
    const res = await api.getMessages(conversationId, page, 50);
    if (res.success && res.data) {
      if (page === 1) {
        set((state) => ({
          messages: { ...state.messages, [conversationId]: res.data! },
        }));
      } else {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [...res.data!, ...(state.messages[conversationId] || [])],
          },
        }));
      }
      return res.hasMore ?? false;
    }
    return false;
  },

  fetchRequests: async () => {
    const res = await api.getRequests();
    if (res.success && res.data) {
      set({ pendingRequests: res.data });
    }
  },

  fetchAllRequests: async () => {
    const res = await api.getAllRequests();
    if (res.success && res.data) {
      set({ allRequests: res.data });
    }
  },
}));
