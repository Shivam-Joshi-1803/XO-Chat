'use client';
import React, { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { Avatar } from '@/components/ui/Avatar';
import { ChatRequestModal } from '@/components/modals/ChatRequestModal';
import { NewChatModal } from '@/components/modals/NewChatModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { DeleteIdentityModal } from '@/components/modals/DeleteIdentityModal';
import { ImagePreviewModal } from '@/components/modals/ImagePreviewModal';
import { ChatListItem } from './ChatListItem';
import { NoChats } from './EmptyStates';
import {
  Copy,
  Plus,
  Settings,
  UserCheck,
  Bell,
  Check,
  KeyRound,
  Search,
} from 'lucide-react';

export function Sidebar() {
  const { user } = useUserStore();
  const { pendingRequests } = useChatStore();
  const {
    setShowNewChatModal,
    setShowSettingsModal,
    setShowProfileModal,
    addToast,
  } = useUIStore();

  const [copied, setCopied] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleCopyUsername = () => {
    if (!user) return;
    navigator.clipboard.writeText(`@${user.username}`);
    setCopied(true);
    addToast('success', 'Username copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const pendingCount = pendingRequests.received.length;

  return (
    <div className="w-full md:w-80 flex flex-col h-full bg-surface border-r-2 border-border shrink-0 select-none">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b-2 border-border bg-foreground text-background shrink-0">
        <div className="flex items-center justify-between">
          <span className="font-black text-lg uppercase tracking-widest">XOCHAT</span>
          <span className="font-mono text-[9px] text-[#FF4F00] uppercase tracking-widest">v1.0</span>
        </div>
      </div>

      {/* Current User Card */}
      <div className="p-4 border-b-2 border-border shrink-0 bg-subtle-gray">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="relative group cursor-pointer"
            onClick={() => setShowProfileModal(true)}
          >
            <Avatar name={user?.display_name || 'Anonymous'} src={user?.avatar_url} size="md" />
            <div className="absolute inset-0 bg-[#FF4F00]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-none">
              <span className="text-white text-[8px] font-black uppercase tracking-wider">Edit</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-black uppercase tracking-wider text-foreground truncate">
              {user?.display_name}
            </h3>
            <button
              onClick={handleCopyUsername}
              className="flex items-center gap-1 text-[10px] text-foreground/50 hover:text-[#FF4F00] transition-colors cursor-pointer font-mono"
            >
              <span className="truncate">@{user?.username}</span>
              {copied ? <Check className="w-2.5 h-2.5 text-[#FF4F00]" /> : <Copy className="w-2.5 h-2.5" />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowNewChatModal(true)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:bg-[#FF4F00] transition-colors rounded-none cursor-pointer border-2 border-border"
          >
            <Plus className="w-3.5 h-3.5" /> New Chat
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-surface text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors relative rounded-none cursor-pointer border-2 border-border"
          >
            <Bell className="w-3.5 h-3.5" />
            Requests
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center bg-[#FF4F00] text-[9px] font-black text-white rounded-none">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Conversations Header */}
      <div className="px-4 py-3 border-b border-border/20 shrink-0">
        <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Conversations</span>
      </div>

      {/* Conversations List */}
      <div className="flex-1 min-h-0 flex flex-col">
        <SidebarConversations />
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t-2 border-border flex items-center justify-between shrink-0 bg-subtle-gray">
        <div className="flex items-center gap-1 text-[9px] text-foreground font-black uppercase tracking-widest">
          <span className="w-2 h-2 bg-[#FF4F00] rounded-none" />
          Secure
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 bg-surface border-2 border-border text-foreground hover:bg-[#FF4F00] hover:text-white transition-colors rounded-none cursor-pointer"
            title="Recovery Key"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowProfileModal(true)}
            className="p-2 bg-surface border-2 border-border text-foreground hover:bg-[#FF4F00] hover:text-white transition-colors rounded-none cursor-pointer"
            title="Edit Profile"
          >
            <UserCheck className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 bg-surface border-2 border-border text-foreground hover:bg-[#FF4F00] hover:text-white transition-colors rounded-none cursor-pointer"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Shared Modals */}
      <ChatRequestModal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} />
      <NewChatModal />
      <SettingsModal />
      <ProfileModal />
      <DeleteIdentityModal />
      <ImagePreviewModal />
    </div>
  );
}

function SidebarConversations() {
  const { conversations } = useChatStore();
  const { setShowNewChatModal } = useUIStore();
  const [filterQuery, setFilterQuery] = useState('');

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
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-4 py-2 shrink-0 border-b border-border/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30" />
          <input
            placeholder="Search chats..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-surface border-2 border-border/30 rounded-none pl-9 pr-3 py-2 text-xs text-foreground placeholder-foreground/30 focus:outline-none focus:border-[#FF4F00] transition-colors"
            autoComplete="off"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <div className="divide-y divide-border/10">
            {filteredConversations.map((conv) => (
              <ChatListItem key={conv.id} conversation={conv} />
            ))}
          </div>
        ) : (
          <NoChats onNewChat={() => setShowNewChatModal(true)} />
        )}
      </div>
    </div>
  );
}
