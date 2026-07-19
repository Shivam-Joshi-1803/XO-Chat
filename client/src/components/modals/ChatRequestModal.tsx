'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { useChatStore } from '@/stores/chatStore';
import { api } from '@/lib/api';
import { Inbox, Check, X, Clock, Loader2, UserCheck } from 'lucide-react';

type Tab = 'received' | 'sent' | 'accepted' | 'rejected';

export function ChatRequestModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { pendingRequests, allRequests, fetchRequests, fetchConversations, setAllRequests, removeRequest } = useChatStore();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<Tab>('received');
  const [handlingId, setHandlingId] = useState<string | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoadingAll(true);
      api.getAllRequests()
        .then((res) => {
          if (res.success && res.data) setAllRequests(res.data);
        })
        .finally(() => setLoadingAll(false));
    }
  }, [isOpen, setAllRequests]);

  const handleAccept = async (requestId: string) => {
    setHandlingId(requestId);
    try {
      const res = await api.acceptRequest(requestId);
      if (res.success) {
        addToast('success', 'Accepted!');
        removeRequest(requestId);
        await Promise.all([fetchRequests(), fetchConversations()]);
      } else {
        addToast('error', res.error || 'Failed to accept');
      }
    } catch {
      addToast('error', 'Network error');
    } finally {
      setHandlingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setHandlingId(requestId);
    try {
      const res = await api.rejectRequest(requestId);
      if (res.success) {
        addToast('info', 'Rejected');
        removeRequest(requestId);
        await fetchRequests();
      } else {
        addToast('error', res.error || 'Failed to reject');
      }
    } catch {
      addToast('error', 'Network error');
    } finally {
      setHandlingId(null);
    }
  };

  const handleCancel = async (requestId: string) => {
    setHandlingId(requestId);
    try {
      const res = await api.cancelRequest(requestId);
      if (res.success) {
        addToast('info', 'Cancelled');
        removeRequest(requestId);
      } else {
        addToast('error', res.error || 'Failed to cancel');
      }
    } catch {
      addToast('error', 'Network error');
    } finally {
      setHandlingId(null);
    }
  };

  const receivedCount = pendingRequests.received.length;
  const sentCount = pendingRequests.sent.length;
  const acceptedCount = allRequests?.accepted.length ?? 0;
  const rejectedCount = allRequests?.rejected_received.length ?? 0;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'received', label: 'Received', count: receivedCount },
    { id: 'sent', label: 'Sent', count: sentCount },
    { id: 'accepted', label: 'Accepted', count: acceptedCount },
    { id: 'rejected', label: 'Rejected', count: rejectedCount },
  ];

  const renderContent = () => {
    if (loadingAll) {
      return (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-6 h-6 border-4 border-border/25 border-t-[#FF4F00] animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Loading requests...</span>
        </div>
      );
    }

    if (activeTab === 'received') {
      if (receivedCount === 0) return <EmptyState icon={<Inbox className="w-6 h-6" />} label="No incoming requests" />;
      return pendingRequests.received.map((req) => (
        <RequestCard key={req.id}>
          <UserInfo name={req.sender?.display_name} username={req.sender?.username} avatar={req.sender?.avatar_url} />
          <div className="flex gap-1.5">
            <Button variant="primary" size="sm" onClick={() => handleAccept(req.id)} disabled={!!handlingId} loading={handlingId === req.id} className="px-3 py-1.5">
              <Check className="w-3 h-3" /> Accept
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleReject(req.id)} disabled={!!handlingId} className="px-3 py-1.5 hover:bg-red-600 hover:text-white hover:border-red-600">
              <X className="w-3 h-3" /> Reject
            </Button>
          </div>
        </RequestCard>
      ));
    }

    if (activeTab === 'sent') {
      if (sentCount === 0) return <EmptyState icon={<Clock className="w-6 h-6" />} label="No sent requests" />;
      return pendingRequests.sent.map((req) => (
        <RequestCard key={req.id}>
          <UserInfo name={req.receiver?.display_name} username={req.receiver?.username} avatar={req.receiver?.avatar_url} />
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#FF4F00] border-2 border-[#FF4F00] px-2 py-1">
              Pending
            </span>
            <Button variant="secondary" size="sm" onClick={() => handleCancel(req.id)} disabled={!!handlingId} loading={handlingId === req.id} className="px-3 py-1.5 hover:bg-red-600 hover:text-white hover:border-red-600">
              Cancel
            </Button>
          </div>
        </RequestCard>
      ));
    }

    if (activeTab === 'accepted') {
      const items = allRequests?.accepted ?? [];
      if (items.length === 0) return <EmptyState icon={<UserCheck className="w-6 h-6" />} label="No accepted connections" />;
      return items.map((req) => (
        <RequestCard key={req.id}>
          <UserInfo name={req.sender?.display_name} username={req.sender?.username} avatar={req.sender?.avatar_url} />
          <span className="text-[9px] font-black uppercase tracking-widest text-foreground border-2 border-border px-2 py-1 bg-subtle-gray">
            Connected
          </span>
        </RequestCard>
      ));
    }

    if (activeTab === 'rejected') {
      const items = allRequests?.rejected_received ?? [];
      if (items.length === 0) return <EmptyState icon={<X className="w-6 h-6" />} label="No rejected requests" />;
      return items.map((req) => (
        <RequestCard key={req.id}>
          <UserInfo name={req.sender?.display_name} username={req.sender?.username} avatar={req.sender?.avatar_url} />
          <span className="text-[9px] font-black uppercase tracking-widest text-foreground/60 border-2 border-border/20 px-2 py-1 bg-background">
            Rejected
          </span>
        </RequestCard>
      ));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chat Requests"
      description="Manage all incoming and outgoing connections."
    >
      <div className="space-y-4 mt-2">
        {/* Tabs Bar */}
        <div className="flex border-2 border-border bg-subtle-gray p-1 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-none transition-colors relative cursor-pointer border-2
                ${activeTab === tab.id
                  ? 'bg-foreground border-border text-background'
                  : 'bg-surface border-transparent text-foreground hover:bg-foreground/5'
                }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 text-[9px] font-mono">
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-0.5 min-h-[160px] flex flex-col">
          {renderContent()}
        </div>
      </div>
    </Modal>
  );
}

function RequestCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 border-2 border-border bg-surface">
      {children}
    </div>
  );
}

function UserInfo({ name, username, avatar }: { name?: string; username?: string; avatar?: string | null }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar name={name || 'Anonymous'} src={avatar} size="sm" />
      <div className="min-w-0">
        <h4 className="text-[11px] font-black uppercase tracking-wider text-foreground truncate">{name}</h4>
        <span className="text-[10px] text-foreground/50 font-mono">@{username}</span>
      </div>
    </div>
  );
}

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-8 text-foreground/40 gap-2">
      <div className="text-foreground">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{label}</span>
    </div>
  );
}
