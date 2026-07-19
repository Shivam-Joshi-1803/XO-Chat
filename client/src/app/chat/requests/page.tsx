'use client';
import React, { useState, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { api } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Inbox, Check, X, ShieldAlert, Clock, RefreshCw, UserCheck } from 'lucide-react';
import type { ChatRequest, PublicUser } from '@/types';

type Tab = 'received' | 'sent' | 'accepted' | 'rejected' | 'blocked';

export default function RequestsPage() {
  const { pendingRequests, allRequests, fetchRequests, fetchConversations, setAllRequests, removeRequest } = useChatStore();
  const { addToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<Tab>('received');
  const [loading, setLoading] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<PublicUser[]>([]);
  const [handlingId, setHandlingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqRes, blockRes] = await Promise.all([
        api.getAllRequests(),
        api.getBlockedUsers(),
      ]);

      if (reqRes.success && reqRes.data) {
        setAllRequests(reqRes.data);
      }
      if (blockRes.success && blockRes.data) {
        setBlockedUsers(blockRes.data);
      }
    } catch {
      addToast('error', 'Failed to load requests data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (requestId: string) => {
    setHandlingId(requestId);
    try {
      const res = await api.acceptRequest(requestId);
      if (res.success) {
        addToast('success', 'Request accepted!');
        removeRequest(requestId);
        await Promise.all([fetchRequests(), fetchConversations()]);
      } else {
        addToast('error', res.error || 'Failed to accept request');
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
        addToast('info', 'Request rejected');
        removeRequest(requestId);
        await fetchRequests();
      } else {
        addToast('error', res.error || 'Failed to reject request');
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
        addToast('info', 'Request cancelled');
        removeRequest(requestId);
      } else {
        addToast('error', res.error || 'Failed to cancel request');
      }
    } catch {
      addToast('error', 'Network error');
    } finally {
      setHandlingId(null);
    }
  };

  const handleUnblock = async (userId: string) => {
    setHandlingId(userId);
    try {
      const res = await api.unblockUser(userId);
      if (res.success) {
        addToast('success', 'User unblocked');
        setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        addToast('error', res.error || 'Failed to unblock');
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
  const blockedCount = blockedUsers.length;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'received', label: 'Received Requests', count: receivedCount },
    { id: 'sent', label: 'Sent Pending', count: sentCount },
    { id: 'accepted', label: 'Connected', count: acceptedCount },
    { id: 'rejected', label: 'Rejected By You', count: rejectedCount },
    { id: 'blocked', label: 'Blocked Users', count: blockedCount },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-white" />
          <span className="text-sm">Fetching request details…</span>
        </div>
      );
    }

    if (activeTab === 'received') {
      if (receivedCount === 0) return <EmptyRequests label="No incoming chat requests." icon={<Inbox className="w-8 h-8" />} />;
      return pendingRequests.received.map((req) => (
        <RequestCard key={req.id}>
          <UserInfo user={req.sender} />
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => handleAccept(req.id)} disabled={!!handlingId} loading={handlingId === req.id}>
              <Check className="w-4 h-4 mr-1" /> Accept
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleReject(req.id)} disabled={!!handlingId} className="hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400">
              <X className="w-4 h-4 mr-1" /> Reject
            </Button>
          </div>
        </RequestCard>
      ));
    }

    if (activeTab === 'sent') {
      if (sentCount === 0) return <EmptyRequests label="No pending outgoing requests." icon={<Clock className="w-8 h-8" />} />;
      return pendingRequests.sent.map((req) => (
        <RequestCard key={req.id}>
          <UserInfo user={req.receiver} />
          <div className="flex items-center gap-3">
            <span className="text-xs text-white bg-white/10 border border-white/20 px-3 py-1 rounded-full font-semibold">
              Pending Approval
            </span>
            <Button variant="secondary" size="sm" onClick={() => handleCancel(req.id)} disabled={!!handlingId} loading={handlingId === req.id} className="hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400">
              Cancel Request
            </Button>
          </div>
        </RequestCard>
      ));
    }

    if (activeTab === 'accepted') {
      const items = allRequests?.accepted ?? [];
      if (items.length === 0) return <EmptyRequests label="No connections yet." icon={<UserCheck className="w-8 h-8" />} />;
      return items.map((req) => (
        <RequestCard key={req.id}>
          <UserInfo user={req.sender} />
          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
            Connected
          </span>
        </RequestCard>
      ));
    }

    if (activeTab === 'rejected') {
      const items = allRequests?.rejected_received ?? [];
      if (items.length === 0) return <EmptyRequests label="No rejected requests." icon={<X className="w-8 h-8" />} />;
      return items.map((req) => (
        <RequestCard key={req.id}>
          <UserInfo user={req.sender} />
          <span className="text-xs text-gray-500 bg-white/5 border border-white/10 px-3 py-1 rounded-full font-semibold">
            Rejected
          </span>
        </RequestCard>
      ));
    }

    if (activeTab === 'blocked') {
      if (blockedCount === 0) return <EmptyRequests label="No blocked users." icon={<ShieldAlert className="w-8 h-8" />} />;
      return blockedUsers.map((user) => (
        <RequestCard key={user.id}>
          <UserInfo user={user} />
          <Button variant="secondary" size="sm" onClick={() => handleUnblock(user.id)} disabled={!!handlingId} loading={handlingId === user.id} className="hover:bg-white/10 hover:border-white/20 hover:text-white">
            Unblock User
          </Button>
        </RequestCard>
      ));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black overflow-hidden p-6 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Requests &amp; Connections</h1>
          <p className="text-xs text-gray-400 mt-1">Manage who can message you and review active sandbox permissions.</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer relative border
              ${activeTab === tab.id
                ? 'bg-white border-white text-black font-black shadow-lg shadow-white/5'
                : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-black/10 text-black' : 'bg-white/10 text-white'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Thread */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1">
        {renderContent()}
      </div>
    </div>
  );
}

function RequestCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors animate-in fade-in duration-200">
      {children}
    </div>
  );
}

function UserInfo({ user }: { user?: PublicUser }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar name={user?.display_name || 'Anonymous'} src={user?.avatar_url} size="md" />
      <div className="min-w-0">
        <h4 className="text-sm font-bold text-white truncate">{user?.display_name}</h4>
        <p className="text-xs text-gray-400 truncate">@{user?.username}</p>
      </div>
    </div>
  );
}

function EmptyRequests({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-600 gap-3 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
      {icon}
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}
