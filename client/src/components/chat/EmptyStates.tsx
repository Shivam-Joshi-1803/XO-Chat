'use client';
import React from 'react';
import { MessageSquarePlus, Inbox, Search } from 'lucide-react';

export function NoChats({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center select-none space-y-4 max-w-sm mx-auto px-4">
      <div className="w-14 h-14 bg-foreground flex items-center justify-center text-background border-2 border-border">
        <MessageSquarePlus className="w-6 h-6 text-[#FF4F00]" />
      </div>
      <div className="space-y-1.5">
        <h4 className="text-xs font-black uppercase tracking-widest text-foreground">No Active Chats</h4>
        <p className="text-xs text-foreground/60 leading-relaxed font-medium">
          Create an identity or start a new chat request to connect with another user.
        </p>
      </div>
      <button
        onClick={onNewChat}
        className="text-[10px] font-black uppercase tracking-widest text-[#FF4F00] hover:text-foreground transition-colors cursor-pointer border-b-2 border-[#FF4F00] hover:border-foreground pb-0.5"
      >
        Start A Chat
      </button>
    </div>
  );
}

export function NoMessages() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 text-center select-none space-y-4 max-w-xs mx-auto px-4">
      <div className="w-12 h-12 bg-subtle-gray border-2 border-border flex items-center justify-center text-foreground">
        <Inbox className="w-5 h-5 text-foreground" />
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-black uppercase tracking-widest text-foreground">No Messages Yet</h4>
        <p className="text-xs text-foreground/60 leading-normal font-medium">
          Send a friendly message to start the conversation!
        </p>
      </div>
    </div>
  );
}

export function NoRequests() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center select-none space-y-3 max-w-xs mx-auto px-4">
      <div className="w-12 h-12 bg-subtle-gray border-2 border-border flex items-center justify-center text-foreground">
        <Inbox className="w-5 h-5 text-foreground" />
      </div>
      <div className="space-y-0.5">
        <h5 className="text-[10px] font-black uppercase tracking-widest text-foreground">No Requests</h5>
        <p className="text-xs text-foreground/60 leading-normal font-medium">
          Incoming and outgoing requests will appear here.
        </p>
      </div>
    </div>
  );
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center select-none space-y-3 max-w-xs mx-auto px-4">
      <div className="w-12 h-12 bg-subtle-gray border-2 border-border flex items-center justify-center text-foreground">
        <Search className="w-5 h-5 text-foreground" />
      </div>
      <div className="space-y-0.5">
        <h5 className="text-[10px] font-black uppercase tracking-widest text-foreground">No Users Found</h5>
        <p className="text-xs text-foreground/60 leading-normal font-medium">
          No matches found for &quot;{query}&quot;. Check spelling and try again.
        </p>
      </div>
    </div>
  );
}
