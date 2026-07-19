'use client';
import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { EmptyChat } from '@/components/chat/EmptyChat';

export default function ChatDashboardPage() {
  const { activeConversationId, conversations } = useChatStore();

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  return (
    <div className="flex-1 min-w-0 h-full flex flex-col bg-background">
      {activeConversation ? (
        <ChatWindow conversation={activeConversation} />
      ) : (
        <EmptyChat />
      )}
    </div>
  );
}
