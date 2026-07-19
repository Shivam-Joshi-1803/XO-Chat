'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useUIStore } from '@/stores/uiStore';
import { useUserStore } from '@/stores/userStore';
import { useChatStore } from '@/stores/chatStore';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Trash2 } from 'lucide-react';

export function DeleteIdentityModal() {
  const { showDeleteModal, setShowDeleteModal, addToast } = useUIStore();
  const { user, logout } = useUserStore();
  const { setConversations, setPendingRequests, setActiveConversation } = useChatStore();
  const router = useRouter();

  const [confirmUsername, setConfirmUsername] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmUsername.toLowerCase() !== user?.username.toLowerCase()) {
      addToast('error', 'Username confirmation does not match');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await api.deleteUser();
      if (res.success) {
        logout();
        setConversations([]);
        setPendingRequests({ received: [], sent: [] });
        setActiveConversation(null);
        localStorage.clear();
        addToast('success', 'Identity permanently deleted.');
        setShowDeleteModal(false);
        router.replace('/');
      } else {
        addToast('error', res.error || 'Failed to delete identity');
      }
    } catch {
      addToast('error', 'Network error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={showDeleteModal}
      onClose={() => {
        setShowDeleteModal(false);
        setConfirmUsername('');
      }}
      title="Delete Identity"
      size="md"
    >
      <div className="space-y-4 mt-2">
        <div className="flex gap-3 p-4 border-2 border-red-600 bg-red-600/10 text-red-600">
          <ShieldAlert className="w-8 h-8 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-widest text-red-600">Critical Warning</h4>
            <p className="text-xs leading-relaxed font-semibold">
              Deleting your identity permanently removes your username, all conversations, messages, media uploads, pending requests, and settings. This action is absolute and cannot be undone.
            </p>
          </div>
        </div>

        <p className="text-xs font-medium text-foreground uppercase tracking-wider">
          To confirm deletion, type your username <span className="font-black text-[#FF4F00]">@{user?.username}</span> below:
        </p>

        <Input
          placeholder={user?.username}
          value={confirmUsername}
          onChange={(e) => setConfirmUsername(e.target.value)}
          autoComplete="off"
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setShowDeleteModal(false);
              setConfirmUsername('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={isDeleting}
            disabled={confirmUsername.toLowerCase() !== user?.username.toLowerCase()}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete Identity
          </Button>
        </div>
      </div>
    </Modal>
  );
}
