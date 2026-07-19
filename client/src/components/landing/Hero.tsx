'use client';
import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { KeyRound, ArrowRight, Shield, Pin, Inbox, Clock, Check } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  const { setShowUsernameModal } = useUIStore();
  const [activeMockupTab, setActiveMockupTab] = useState<'chat' | 'recovery' | 'requests'>('chat');

  return (
    <div className="bg-background text-foreground font-sans selection:bg-[#FF4F00] selection:text-white pb-20">
      {/* 12-Column Grid Hero Container */}
      <section className="px-6 md:px-12 pt-32 pb-16 max-w-[1280px] mx-auto grid grid-cols-4 md:grid-cols-12 gap-6 min-h-[600px] items-center">
        <div className="col-span-4 md:col-span-7 flex flex-col justify-center">
          {/* Header pill */}
          <div className="inline-flex items-center gap-2 border border-border bg-surface px-3 py-1.5 w-fit mb-6 text-[10px] md:text-xs font-bold uppercase tracking-widest select-none">
            <span className="w-2 h-2 bg-[#FF4F00]" />
            <span>Zero-Log Messaging Sandbox</span>
          </div>

          <h1 className="text-[38px] xs:text-[52px] md:text-[80px] font-black uppercase leading-[0.95] tracking-tighter mb-6 text-foreground">
            ANONYMOUS.<br />
            REAL-TIME.<br />
            <span className="text-[#FF4F00]">SECURE.</span>
          </h1>

          <p className="text-sm xs:text-lg md:text-2xl font-bold max-w-xl text-foreground/60 leading-tight mb-8">
            Communication stripped to its absolute essence. No tracking. No storage. Pure cryptographic signal.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 xs:gap-4">
            <button
              onClick={() => setShowUsernameModal(true)}
              className="bg-foreground text-background px-6 py-4 text-xs xs:px-10 xs:py-5 xs:text-sm uppercase tracking-widest font-black border-2 border-border hover:bg-[#FF4F00] hover:border-[#FF4F00] hover:text-white transition-colors duration-150 cursor-pointer rounded-none flex items-center justify-center gap-2"
            >
              Create Identity
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/recover"
              className="bg-surface text-foreground px-6 py-4 text-xs xs:px-10 xs:py-5 xs:text-sm uppercase tracking-widest font-black border-2 border-border hover:bg-foreground hover:text-background transition-colors duration-150 rounded-none flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Recover Account
            </Link>
          </div>
        </div>

        {/* Hero Visual Mockup Container (Interactive Simulation) */}
        <div className="col-span-4 md:col-span-5 w-full mt-10 md:mt-0">
          <div className="border-2 border-border bg-surface p-2 shadow-[6px_6px_0px_0px_var(--border)] rounded-none">
            <div className="border border-border bg-background rounded-none overflow-hidden">
              {/* Mockup Topbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border px-4 py-3 bg-surface gap-2">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-foreground" />
                  <span>XOCHAT.SYS</span>
                </div>
                
                {/* Mockup Tab Controls */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveMockupTab('chat')}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer rounded-none border ${
                      activeMockupTab === 'chat' 
                        ? 'bg-foreground text-background border-border' 
                        : 'text-foreground/60 border-transparent hover:border-border hover:text-foreground'
                    }`}
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveMockupTab('requests')}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer rounded-none border ${
                      activeMockupTab === 'requests' 
                        ? 'bg-foreground text-background border-border' 
                        : 'text-foreground/60 border-transparent hover:border-border hover:text-foreground'
                    }`}
                  >
                    Requests
                  </button>
                  <button
                    onClick={() => setActiveMockupTab('recovery')}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer rounded-none border ${
                      activeMockupTab === 'recovery' 
                        ? 'bg-foreground text-background border-border' 
                        : 'text-foreground/60 border-transparent hover:border-border hover:text-foreground'
                    }`}
                  >
                    Recovery
                  </button>
                </div>
              </div>

              {/* Tab Screen Content */}
              <div className="aspect-[4/3] flex items-center justify-center p-4 bg-surface relative">
                {/* Chat View */}
                {activeMockupTab === 'chat' && (
                  <div className="w-full space-y-4 text-left">
                    <div className="flex gap-2.5">
                      <div className="w-8 h-8 bg-foreground text-background flex items-center justify-center text-[10px] font-black uppercase tracking-wider rounded-none shrink-0 border border-border">
                        GH
                      </div>
                      <div className="bg-subtle-gray border border-border rounded-none p-3 text-xs text-foreground font-medium">
                        Hey! Did you see the new cleanup job?
                      </div>
                    </div>
                    
                    <div className="flex gap-2.5 justify-end">
                      <div className="bg-surface border-2 border-border rounded-none p-3 text-xs text-foreground font-semibold max-w-[80%]">
                        Yes. It checks users inactive for 7 days. If they have no chats, blocks, or active media, they get completely wiped.
                      </div>
                      <div className="w-8 h-8 bg-[#FF4F00] text-white flex items-center justify-center text-[10px] font-black uppercase tracking-wider rounded-none shrink-0 border border-border">
                        ME
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <div className="w-8 h-8 bg-foreground text-background flex items-center justify-center text-[10px] font-black uppercase tracking-wider rounded-none shrink-0 border border-border">
                        GH
                      </div>
                      <div className="bg-subtle-gray border border-border rounded-none p-3 text-xs text-foreground max-w-[80%] font-medium space-y-2">
                        <div className="flex items-center gap-1 text-[9px] text-white font-bold bg-[#FF4F00] px-1.5 py-0.5 w-fit uppercase tracking-widest">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </div>
                        <p>Outstanding! That makes abandoned names available again safely.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Requests View */}
                {activeMockupTab === 'requests' && (
                  <div className="w-full space-y-3 text-left">
                    <div className="p-3 border border-border bg-subtle-gray flex items-center justify-between rounded-none">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-foreground text-background flex items-center justify-center text-[9px] font-black uppercase tracking-wider rounded-none border border-border">AL</div>
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-foreground">@alice</h4>
                          <p className="text-[9px] text-foreground/60 uppercase tracking-wider">Incoming request</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button className="px-2 py-1 bg-foreground text-background text-[9px] font-black uppercase tracking-widest rounded-none border border-border hover:bg-[#FF4F00] hover:border-[#FF4F00] hover:text-white transition-colors cursor-pointer">Accept</button>
                        <button className="px-2 py-1 bg-surface text-foreground text-[9px] font-bold uppercase tracking-widest rounded-none border border-border hover:bg-foreground hover:text-background transition-colors cursor-pointer">Ignore</button>
                      </div>
                    </div>

                    <div className="p-3 border border-border bg-surface flex items-center justify-between rounded-none opacity-60">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-foreground text-background flex items-center justify-center text-[9px] font-black uppercase tracking-wider rounded-none border border-border">BO</div>
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-foreground">@bob</h4>
                          <p className="text-[9px] text-foreground/60 uppercase tracking-wider">Pending approval</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#FF4F00] bg-[#FF4F00]/10 border border-[#FF4F00]/20 px-2 py-0.5 rounded-none">Sent</span>
                    </div>
                  </div>
                )}

                {/* Recovery View */}
                {activeMockupTab === 'recovery' && (
                  <div className="w-full space-y-4 text-center">
                    <div className="w-10 h-10 border border-border bg-foreground flex items-center justify-center mx-auto text-background rounded-none">
                      <KeyRound className="w-5 h-5 text-[#FF4F00]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase tracking-wider text-foreground">Argon2id Recovery Key</h4>
                      <p className="text-[10px] text-foreground/60 uppercase tracking-wider">Restores identity access securely.</p>
                    </div>
                    <div className="border border-border bg-subtle-gray p-2.5 max-w-[280px] mx-auto text-center rounded-none font-mono text-[10px] font-bold text-foreground tracking-widest select-all">
                      XO-8F4C-3E90-A11B-44C1
                    </div>
                    <p className="text-[9px] text-foreground/60 max-w-xs mx-auto leading-relaxed uppercase tracking-wider">
                      ⚠️ Shown once. Server only stores the hash value, keeping your secret safe.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Anchor Full-Width (Status Encrypted banner from Swiss design) */}
      <section className="w-full h-[200px] bg-foreground flex items-center justify-center text-background select-none relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-lines opacity-10" />
        <div className="border-2 border-background p-8 text-center rounded-none">
          <span className="font-mono text-lg md:text-xl tracking-[0.3em] font-black uppercase text-[#FF4F00]">
            STATUS: ENCRYPTED // ZERO_KNOWLEDGE
          </span>
        </div>
      </section>
    </div>
  );
}
