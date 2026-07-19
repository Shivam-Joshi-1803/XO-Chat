'use client';
// ──────────────────────────────────────────────
// XOChat — Conversation Actions Hook
// ──────────────────────────────────────────────
import { useCallback } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { api } from '@/lib/api';

export function useConversationActions() {
  const { removeConversation, updateConversation } = useChatStore();
  const { addToast } = useUIStore();

  const pin = useCallback(async (conversationId: string, currentlyPinned: boolean) => {
    const res = await api.pinConversation(conversationId, !currentlyPinned);
    if (res.success) {
      updateConversation(conversationId, {
        pinned_by: currentlyPinned ? [] : ['__pinned__'], // UI state — refreshed on next load
      });
      addToast('success', currentlyPinned ? 'Unpinned' : 'Pinned');
    } else {
      addToast('error', res.error || 'Failed to update pin');
    }
  }, [updateConversation, addToast]);

  const archive = useCallback(async (conversationId: string, currentlyArchived: boolean) => {
    const res = await api.archiveConversation(conversationId, !currentlyArchived);
    if (res.success) {
      addToast('success', currentlyArchived ? 'Unarchived' : 'Archived');
      // Remove from list; will reappear when unarchived
      if (!currentlyArchived) {
        removeConversation(conversationId);
      }
    } else {
      addToast('error', res.error || 'Failed to archive');
    }
  }, [removeConversation, addToast]);

  const close = useCallback(async (conversationId: string) => {
    const res = await api.closeConversation(conversationId);
    if (res.success) {
      removeConversation(conversationId);
      addToast('info', 'Chat closed (messages preserved)');
    } else {
      addToast('error', res.error || 'Failed to close chat');
    }
  }, [removeConversation, addToast]);

  const mute = useCallback(async (conversationId: string, currentlyMuted: boolean) => {
    const res = await api.muteConversation(conversationId, !currentlyMuted);
    if (res.success) {
      updateConversation(conversationId, {
        muted_by: currentlyMuted ? [] : ['__muted__'], // UI state — refreshed on next load
      });
      addToast('success', currentlyMuted ? 'Unmuted' : 'Muted');
    } else {
      addToast('error', res.error || 'Failed to mute');
    }
  }, [updateConversation, addToast]);

  const deleteConv = useCallback(async (conversationId: string) => {
    const res = await api.deleteConversation(conversationId);
    if (res.success) {
      removeConversation(conversationId);
      addToast('success', 'Conversation deleted');
    } else {
      addToast('error', res.error || 'Failed to delete');
    }
  }, [removeConversation, addToast]);

  const blockUser = useCallback(async (userId: string) => {
    const res = await api.blockUser(userId);
    if (res.success) {
      addToast('success', 'User blocked');
    } else {
      addToast('error', res.error || 'Failed to block user');
    }
  }, [addToast]);

  return { pin, archive, close, mute, deleteConv, blockUser };
}
