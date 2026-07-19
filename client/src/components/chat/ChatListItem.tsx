'use client';
import React, { memo, useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import type { Conversation } from '@/types';
import {
  Pin, PinOff, Image as ImageIcon, Archive, VolumeX, Volume2,
  Trash2, ShieldOff, MessageSquare, X,
} from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useConversationActions } from '@/hooks/useConversationActions';

interface ChatListItemProps {
  conversation: Conversation;
}

function formatMessageTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export const ChatListItem = memo(function ChatListItem({ conversation }: ChatListItemProps) {
  const { activeConversationId, setActiveConversation, onlineUsers } = useChatStore();
  const { user: currentUser } = useUserStore();
  const actions = useConversationActions();

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const otherUser = conversation.other_user;
  if (!otherUser) return null;

  const isActive = activeConversationId === conversation.id;
  const isOnline = onlineUsers.has(otherUser.id) || otherUser.online;
  const isPinned = conversation.pinned_by?.includes(currentUser?.id || '') ?? false;
  const isMuted = conversation.muted_by?.includes(currentUser?.id || '') ?? false;

  const handleSelect = () => {
    setActiveConversation(conversation.id);
    setMenuOpen(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const menuW = 200;
    const menuH = 280;
    const x = Math.min(e.clientX, viewportW - menuW - 12);
    const y = Math.min(e.clientY, viewportH - menuH - 12);
    setMenuPos({ x, y });
    setMenuOpen(true);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const renderLastMessage = () => {
    const lastMsg = conversation.last_message;
    if (!lastMsg) return <span className="text-foreground/30 italic text-[10px]">No messages yet</span>;
    if (lastMsg.type === 'image') {
      return (
        <span className="flex items-center gap-1 text-[10px] text-foreground/50">
          <ImageIcon className="w-3 h-3" /> Image
        </span>
      );
    }
    return <span className="truncate block text-[10px] text-foreground/50">{lastMsg.content}</span>;
  };

  return (
    <>
      <button
        onClick={handleSelect}
        onContextMenu={handleContextMenu}
        className={`
          w-full flex items-center gap-3 px-4 py-3 transition-all duration-100 cursor-pointer text-left
          border-l-4 border-transparent
          ${isActive
            ? 'bg-foreground text-background border-l-[#FF4F00]'
            : 'hover:bg-foreground/5 text-foreground hover:border-l-foreground/30'
          }
        `}
      >
        <Avatar
          name={otherUser.display_name}
          src={otherUser.avatar_url}
          online={isOnline}
          size="md"
        />

        <div className="flex-1 min-w-0 space-y-0.5">
          <div className="flex items-center justify-between">
            <h4 className={`text-xs font-black uppercase tracking-wide truncate max-w-[65%] ${isActive ? 'text-background' : 'text-foreground'}`}>
              {otherUser.display_name}
            </h4>
            <span className={`text-[9px] font-bold shrink-0 ${isActive ? 'text-background/60' : 'text-foreground/30'}`}>
              {conversation.last_message ? formatMessageTime(conversation.last_message.created_at) : ''}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-2">
              {renderLastMessage()}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {isMuted && <VolumeX className="w-2.5 h-2.5 text-foreground/30" />}
              {isPinned && <Pin className={`w-2.5 h-2.5 ${isActive ? 'text-[#FF4F00]' : 'text-foreground/40'}`} />}
              <Badge count={conversation.unread_count || 0} />
            </div>
          </div>
        </div>
      </button>

      {/* Context Menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          style={{ left: menuPos.x, top: menuPos.y }}
          className="fixed z-[9999] w-52 bg-surface border-2 border-border brutalist-shadow-sm overflow-hidden"
        >
          <div className="px-3 py-2 border-b-2 border-border bg-foreground">
            <span className="text-[9px] font-black uppercase tracking-widest text-background">Options</span>
          </div>
          <div className="p-1">
            <ContextMenuItem icon={<MessageSquare className="w-3.5 h-3.5" />} label="Open Chat" onClick={handleSelect} />
            <div className="h-px bg-border/10 my-1" />
            <ContextMenuItem
              icon={isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
              label={isPinned ? 'Unpin' : 'Pin'}
              onClick={() => { actions.pin(conversation.id, isPinned); setMenuOpen(false); }}
            />
            <ContextMenuItem
              icon={isMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              label={isMuted ? 'Unmute' : 'Mute'}
              onClick={() => { actions.mute(conversation.id, isMuted); setMenuOpen(false); }}
            />
            <ContextMenuItem
              icon={<Archive className="w-3.5 h-3.5" />}
              label="Archive"
              onClick={() => { actions.archive(conversation.id, false); setMenuOpen(false); }}
            />
            <ContextMenuItem
              icon={<X className="w-3.5 h-3.5" />}
              label="Close Chat"
              onClick={() => { actions.close(conversation.id); setMenuOpen(false); }}
            />
            <div className="h-px bg-border/10 my-1" />
            <ContextMenuItem
              icon={<ShieldOff className="w-3.5 h-3.5" />}
              label="Block User"
              danger
              onClick={() => { actions.blockUser(otherUser.id); setMenuOpen(false); }}
            />
            <ContextMenuItem
              icon={<Trash2 className="w-3.5 h-3.5" />}
              label="Delete Chat"
              danger
              onClick={() => { actions.deleteConv(conversation.id); setMenuOpen(false); }}
            />
          </div>
        </div>
      )}
    </>
  );
});

function ContextMenuItem({
  icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer rounded-none
        ${danger
          ? 'text-red-600 hover:bg-red-600/10'
          : 'text-foreground hover:bg-foreground/5'
        }`}
    >
      {icon}
      {label}
    </button>
  );
}
