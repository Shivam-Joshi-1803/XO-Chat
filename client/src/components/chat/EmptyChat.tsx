'use client';
import React from 'react';
import { MessageSquare, Shield, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';

export function EmptyChat() {
  const { setShowNewChatModal } = useUIStore();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-background relative overflow-hidden">
      {/* Decorative Swiss cross / grid element */}
      <div className="absolute inset-0 grid grid-cols-12 gap-6 opacity-[0.03] pointer-events-none p-8">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="border-2 border-foreground aspect-square" />
        ))}
      </div>

      <div className="relative z-10 max-w-sm space-y-6 flex flex-col items-center">
        <div className="w-16 h-16 bg-foreground flex items-center justify-center text-background border-2 border-border shadow-[4px_4px_0px_0px_#FF4F00]">
          <MessageSquare className="w-7 h-7" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-base font-black uppercase tracking-widest text-foreground">No Chat Active</h2>
          <p className="text-xs text-foreground/50 leading-relaxed font-semibold">
            Select an existing conversation from the sidebar, or search a username to start a new handshake.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowNewChatModal(true)}
          className="px-8 py-3 text-xs"
        >
          Start a Chat
        </Button>

        {/* Security indicators */}
        <div className="pt-8 flex items-center gap-4 border-t-2 border-border/10 w-full justify-center text-[10px] text-foreground/50 font-black uppercase tracking-wider">
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-[#FF4F00]" /> Secure Channel</span>
          <span className="flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5 text-[#FF4F00]" /> Ephemeral</span>
        </div>
      </div>
    </div>
  );
}
