'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { api } from '@/lib/api';
import { useUIStore } from '@/stores/uiStore';
import { useDebounce } from '@/hooks/useDebounce';
import { useChatStore } from '@/stores/chatStore';
import { useUserStore } from '@/stores/userStore';
import { Search, UserPlus, AlertCircle } from 'lucide-react';
import type { PublicUser } from '@/types';

const searchSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

export function NewChatModal() {
  const { showNewChatModal, setShowNewChatModal, addToast } = useUIStore();
  const { fetchRequests } = useChatStore();
  const { user: currentUser } = useUserStore();

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [searchResults, setSearchResults] = useState<PublicUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sendingRequestTo, setSendingRequestTo] = useState<string | null>(null);

  useEffect(() => {
    if (debouncedSearch.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      try {
        const res = await api.searchUsers(debouncedSearch);
        if (res.success && res.data) {
          const filtered = res.data.filter((u) => u.id !== currentUser?.id);
          setSearchResults(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch, currentUser]);

  const handleSendRequest = async (username: string) => {
    setSendingRequestTo(username);
    try {
      const res = await api.sendRequest(username);
      if (res.success) {
        addToast('success', `Chat request sent!`);
        fetchRequests();
        setShowNewChatModal(false);
        setSearchInput('');
        setSearchResults([]);
      } else {
        addToast('error', res.error || 'Failed to send request');
      }
    } catch {
      addToast('error', 'Network error');
    } finally {
      setSendingRequestTo(null);
    }
  };

  return (
    <Modal
      isOpen={showNewChatModal}
      onClose={() => {
        setShowNewChatModal(false);
        setSearchInput('');
        setSearchResults([]);
      }}
      title="Start Conversation"
      description="Search a username to initiate connection."
    >
      <div className="space-y-4 mt-2">
        <Input
          icon={<Search className="w-4 h-4 text-foreground" />}
          placeholder="Search by username..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          autoComplete="off"
        />

        {/* Results List */}
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1 min-h-[100px] flex flex-col justify-start">
          {isSearching && (
            <div className="flex items-center justify-center py-6 text-sm gap-2">
              <div className="w-5 h-5 border-4 border-border/25 border-t-[#FF4F00] rounded-none animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Searching...</span>
            </div>
          )}

          {!isSearching && searchInput.trim().length >= 2 && searchResults.length === 0 && (
            <div className="text-center py-6 text-foreground/50 text-xs flex flex-col items-center gap-1.5 font-bold uppercase tracking-wide">
              <AlertCircle className="w-5 h-5 text-[#FF4F00]" />
              No matches found
            </div>
          )}

          {!isSearching && searchInput.trim().length < 2 && (
            <div className="text-center py-8 text-foreground/40 text-[10px] font-bold uppercase tracking-widest">
              Type 2+ characters to search
            </div>
          )}

          {!isSearching && searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 border-2 border-border bg-subtle-gray hover:bg-foreground/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar name={user.display_name} src={user.avatar_url} size="md" />
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-foreground">{user.display_name}</h4>
                  <span className="text-[10px] text-foreground/50 font-mono">@{user.username}</span>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSendRequest(user.username)}
                loading={sendingRequestTo === user.username}
                className="gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
