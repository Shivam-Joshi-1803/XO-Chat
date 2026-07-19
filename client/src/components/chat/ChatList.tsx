'use client';
import React, { useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { ChatListItem } from './ChatListItem';
import { Input } from '@/components/ui/Input';
import { Search, MessageSquarePlus } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export function ChatList() {
  const { conversations } = useChatStore();
  const { setShowNewChatModal } = useUIStore();
  const [filterQuery, setFilterQuery] = useState('');

  // Filter conversations based on query
  const filteredConversations = conversations.filter((conv) => {
    const otherUser = conv.other_user;
    if (!otherUser) return false;
    const query = filterQuery.toLowerCase();
    return (
      otherUser.username.toLowerCase().includes(query) ||
      otherUser.display_name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-black border-r border-white/5">
      {/* Search box */}
      <div className="p-4 border-b border-white/5 space-y-3 shrink-0">
        <Input
          icon={<Search className="w-4 h-4 text-gray-500" />}
          placeholder="Search chats..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* Conversations scroll area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => (
            <ChatListItem key={conv.id} conversation={conv} />
          ))
        ) : (
          <div className="text-center py-12 px-4 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-300">No conversations yet</h4>
              <p className="text-xs text-gray-500">Search for a username to start talking.</p>
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="text-xs font-semibold text-white hover:text-gray-300 underline transition-colors cursor-pointer"
            >
              Start a conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
