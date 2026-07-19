'use client';
// ──────────────────────────────────────────────
// XOChat — Socket Provider
// ──────────────────────────────────────────────
import React, { useEffect, createContext, useContext } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket, connectSocket, disconnectSocket } from '@/lib/socket';
import { useUserStore } from '@/stores/userStore';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import type { Message, ChatRequest } from '@/types';

const SocketContext = createContext<Socket | null>(null);

export function useSocket(): Socket | null {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUserStore();
  const {
    addMessage,
    updateConversationLastMessage,
    setTyping,
    setUserOnline,
    removeMessage,
    removeConversation,
    fetchConversations,
    fetchRequests,
    updateUnreadCount,
  } = useChatStore();
  const { addToast } = useUIStore();

  const socket = isAuthenticated ? getSocket() : null;

  useEffect(() => {
    if (!isAuthenticated) return;

    connectSocket();
    const s = getSocket();

    // ── Presence ────────────────────────────
    s.on('user:online', (data: { userId: string }) => {
      setUserOnline(data.userId, true);
    });

    s.on('user:offline', (data: { userId: string }) => {
      setUserOnline(data.userId, false);
    });

    // ── Typing ──────────────────────────────
    s.on('typing:start', (data: { conversationId: string }) => {
      setTyping(data.conversationId, true);
    });

    s.on('typing:stop', (data: { conversationId: string }) => {
      setTyping(data.conversationId, false);
    });

    // ── Messages ────────────────────────────
    s.on('message:new', (message: Message) => {
      addMessage(message.conversation_id, message);
      updateConversationLastMessage(message.conversation_id, message);
      // Increment unread if not actively viewing this conversation
      const activeId = useChatStore.getState().activeConversationId;
      if (activeId !== message.conversation_id) {
        const conv = useChatStore.getState().conversations.find(
          (c) => c.id === message.conversation_id
        );
        if (conv) {
          updateUnreadCount(message.conversation_id, (conv.unread_count || 0) + 1);
        }
      }
    });

    s.on('message:delivered', (data: { messageId: string; conversationId: string }) => {
      // Message was delivered, could update UI indicator
    });

    s.on('message:seen', (data: { conversationId: string; seenBy: string }) => {
      // Mark all messages in this conversation as read in local state
      const state = useChatStore.getState();
      const msgs = state.messages[data.conversationId];
      if (msgs) {
        const updated = msgs.map((m) => ({ ...m, read: true }));
        state.setMessages(data.conversationId, updated);
      }
    });

    s.on('message:deleted', (data: { messageId: string; conversationId: string }) => {
      removeMessage(data.conversationId, data.messageId);
    });

    // ── Requests ────────────────────────────
    s.on('request:new', (request: ChatRequest) => {
      fetchRequests();
      const senderName = request.sender?.display_name || request.sender?.username || 'Someone';
      addToast('info', `${senderName} wants to chat with you!`);
    });

    s.on('request:accepted', () => {
      fetchConversations();
      fetchRequests();
      addToast('success', 'Chat request accepted!');
    });

    s.on('request:rejected', () => {
      fetchRequests();
    });

    // ── Conversation ────────────────────────
    s.on('conversation:deleted', (data: { conversationId: string }) => {
      removeConversation(data.conversationId);
    });

    // ── Errors ──────────────────────────────
    s.on('error:message', (data: { error: string }) => {
      addToast('error', data.error);
    });

    return () => {
      s.off('user:online');
      s.off('user:offline');
      s.off('typing:start');
      s.off('typing:stop');
      s.off('message:new');
      s.off('message:delivered');
      s.off('message:seen');
      s.off('message:deleted');
      s.off('request:new');
      s.off('request:accepted');
      s.off('request:rejected');
      s.off('conversation:deleted');
      s.off('error:message');
      disconnectSocket();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
