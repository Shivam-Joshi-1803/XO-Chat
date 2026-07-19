'use client';
import React, { useEffect, useRef, useState, UIEvent } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { MessageSkeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import type { Message, Conversation } from '@/types';
import { Lock, ArrowDown } from 'lucide-react';

interface ChatWindowProps {
  conversation: Conversation;
}

export const ChatWindow = React.memo(function ChatWindow({ conversation }: ChatWindowProps) {
  const { user: currentUser } = useUserStore();
  const {
    messages,
    fetchMessages,
    addMessage,
    typingUsers,
    updateUnreadCount,
  } = useChatStore();

  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  const chatMessages = messages[conversation.id] || [];
  const otherUser = conversation.other_user;
  const isTyping = otherUser ? typingUsers[conversation.id] : false;

  useEffect(() => {
    const markRead = async () => {
      try {
        await api.markAsRead(conversation.id);
        updateUnreadCount(conversation.id, 0);
      } catch (err) {
        console.error(err);
      }
    };
    markRead();
  }, [conversation.id, chatMessages.length]);

  useEffect(() => {
    const loadInitial = async () => {
      setIsLoadingMessages(true);
      try {
        const more = await fetchMessages(conversation.id, 1);
        setHasMore(more);
        setPage(1);
        setTimeout(scrollToBottom, 50);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    loadInitial();
  }, [conversation.id]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleScroll = async (e: UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 200;
    setShowScrollBottom(!isNearBottom);

    if (target.scrollTop === 0 && hasMore && !isLoadingMessages) {
      setIsLoadingMessages(true);
      prevScrollHeightRef.current = target.scrollHeight;
      try {
        const nextPage = page + 1;
        const more = await fetchMessages(conversation.id, nextPage);
        setHasMore(more);
        setPage(nextPage);
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop =
              scrollRef.current.scrollHeight - prevScrollHeightRef.current;
          }
        }, 10);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingMessages(false);
      }
    }
  };

  useEffect(() => {
    if (chatMessages.length === 0) return;
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (lastMsg.sender_id === currentUser?.id) {
      scrollToBottom();
    } else {
      if (scrollRef.current) {
        const target = scrollRef.current;
        const isNearBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 300;
        if (isNearBottom) setTimeout(scrollToBottom, 50);
      }
    }
  }, [chatMessages.length, currentUser?.id]);

  const handleMessageSentLocally = (newMsg: Message) => {
    addMessage(conversation.id, newMsg);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background min-w-0 relative">
      {/* Conversation Header */}
      <ChatHeader conversation={conversation} />

      {/* Messages Thread Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-6 px-4 md:px-8 space-y-2 relative min-h-0"
      >
        {isLoadingMessages && page > 1 && (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-4 border-border/20 border-t-[#FF4F00] rounded-none animate-spin" />
          </div>
        )}

        {isLoadingMessages && page === 1 ? (
          <MessageSkeleton />
        ) : chatMessages.length > 0 ? (
          chatMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onReply={(msg) => setReplyTarget(msg)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center select-none space-y-6">
            <div className="w-14 h-14 bg-foreground flex items-center justify-center">
              <Lock className="w-7 h-7 text-background" />
            </div>
            <div className="space-y-2 max-w-xs">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Secure Channel Open</h4>
              <p className="text-xs text-foreground/40 leading-relaxed font-medium">
                All communications in this sandbox are fully encrypted in transit and ephemeral.
              </p>
            </div>
            <div className="w-32 h-px bg-foreground/20" />
          </div>
        )}

        {/* Typing Indicator */}
        {isTyping && otherUser && (
          <div className="pt-2">
            <TypingIndicator displayName={otherUser.display_name} />
          </div>
        )}
      </div>

      {/* Scroll to Bottom button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-6 p-2.5 bg-foreground text-background border-2 border-border hover:bg-[#FF4F00] hover:border-[#FF4F00] hover:text-white transition-colors rounded-none cursor-pointer z-40 shadow-[3px_3px_0px_0px_#FF4F00]"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Message Input */}
      <MessageInput
        conversationId={conversation.id}
        replyTarget={replyTarget}
        onClearReply={() => setReplyTarget(null)}
        onMessageSent={handleMessageSentLocally}
      />
    </div>
  );
});
