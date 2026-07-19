'use client';
import React, { useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import { useUIStore } from '@/stores/uiStore';
import { Avatar } from '@/components/ui/Avatar';
import { api } from '@/lib/api';
import {
  Pin, Trash2, ShieldAlert, MoreVertical, ChevronLeft, Copy, Check, UserX,
} from 'lucide-react';
import type { Conversation } from '@/types';

interface ChatHeaderProps {
  conversation: Conversation;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  const { user: currentUser } = useUserStore();
  const { onlineUsers, fetchConversations, setActiveConversation } = useChatStore();
  const { addToast } = useUIStore();

  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const otherUser = conversation.other_user;
  if (!otherUser) return null;

  const isOnline = onlineUsers.has(otherUser.id) || otherUser.online;
  const isPinned = conversation.pinned_by?.includes(currentUser?.id || '');

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(`@${otherUser.username}`);
    setCopied(true);
    addToast('success', 'Username copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePin = async () => {
    try {
      const res = await api.pinConversation(conversation.id, !isPinned);
      if (res.success) {
        addToast('success', isPinned ? 'Chat unpinned' : 'Chat pinned');
        await fetchConversations();
      }
    } catch { addToast('error', 'Failed to toggle pin'); }
  };

  const handleDeleteChat = async () => {
    if (!confirm('Delete this conversation?')) return;
    try {
      const res = await api.deleteConversation(conversation.id);
      if (res.success) {
        addToast('success', 'Conversation deleted');
        setActiveConversation(null);
        await fetchConversations();
      }
    } catch { addToast('error', 'Failed to delete'); }
  };

  const handleBlockUser = async () => {
    if (!confirm(`Block @${otherUser.username}?`)) return;
    try {
      const res = await api.blockUser(otherUser.id);
      if (res.success) {
        addToast('success', `@${otherUser.username} blocked`);
        setActiveConversation(null);
        await fetchConversations();
      } else {
        addToast('error', res.error || 'Failed to block');
      }
    } catch { addToast('error', 'Failed to block user'); }
  };

  return (
    <div className="h-16 border-b-2 border-border bg-surface px-4 flex items-center justify-between shrink-0 select-none z-30">
      {/* User Info */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setActiveConversation(null)}
          className="md:hidden p-1.5 border-2 border-border text-foreground hover:bg-foreground hover:text-background transition-colors rounded-none"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <Avatar name={otherUser.display_name} src={otherUser.avatar_url} online={isOnline} size="md" />

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground truncate">
              {otherUser.display_name}
            </h3>
            {isPinned && <Pin className="w-3 h-3 text-[#FF4F00] shrink-0" />}
          </div>
          <button
            onClick={handleCopyUsername}
            className="flex items-center gap-1 text-[10px] text-foreground/40 hover:text-[#FF4F00] transition-colors font-mono"
          >
            <span>@{otherUser.username}</span>
            {copied ? <Check className="w-2.5 h-2.5 text-[#FF4F00]" /> : <Copy className="w-2.5 h-2.5" />}
          </button>
        </div>
      </div>

      {/* Status Chip */}
      <div className="hidden md:flex items-center gap-1 px-3 py-1.5 border-2 border-border/20">
        <div className={`w-1.5 h-1.5 rounded-none ${isOnline ? 'bg-[#FF4F00]' : 'bg-foreground/20'}`} />
        <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 relative">
        <button
          onClick={handleTogglePin}
          className={`p-2 border-2 transition-colors cursor-pointer rounded-none ${
            isPinned
              ? 'bg-[#FF4F00] border-[#FF4F00] text-white'
              : 'bg-surface border-border text-foreground hover:bg-foreground hover:text-background'
          }`}
          title={isPinned ? 'Unpin' : 'Pin'}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleDeleteChat}
          className="p-2 border-2 border-border bg-surface text-foreground hover:bg-red-600 hover:border-red-600 hover:text-white transition-colors cursor-pointer rounded-none"
          title="Delete chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-2 border-2 border-border bg-surface text-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer rounded-none"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-surface border-2 border-border brutalist-shadow-sm p-1 z-50">
              <div className="px-3 py-2 border-b border-border/10">
                <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Actions</span>
              </div>
              <button
                onClick={() => { setShowDropdown(false); handleBlockUser(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5" /> Block User
              </button>
              <button
                onClick={() => { setShowDropdown(false); addToast('info', 'User report submitted'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-foreground hover:bg-foreground/5 transition-colors text-left cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Report User
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
