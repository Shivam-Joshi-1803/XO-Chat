'use client';
import React, { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useChatStore } from '@/stores/chatStore';
import { Sidebar } from '@/components/chat/Sidebar';
import { useRouter } from 'next/navigation';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { fetchUser, user, isAuthenticated, isLoading } = useUserStore();
  const { fetchConversations, fetchRequests, activeConversationId } = useChatStore();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversations();
      fetchRequests();
    }
  }, [isAuthenticated, user, fetchConversations, fetchRequests]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-border border-t-primary rounded-none animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest text-foreground">Securing environment...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Shared Navigation Sidebar */}
      <div className={`${activeConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-80 h-full shrink-0`}>
        <Sidebar />
      </div>

      {/* Main Chat Area */}
      <main className={`${activeConversationId ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 flex flex-col h-full bg-background border-l-2 border-border`}>
        {children}
      </main>
    </div>
  );
}
