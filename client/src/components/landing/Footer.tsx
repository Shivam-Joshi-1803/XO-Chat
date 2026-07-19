'use client';
import React from 'react';
import { TextScramble } from '@/components/ui/TextScramble';

export function Footer() {
  return (
    <footer className="w-full bg-foreground border-t-2 border-border relative overflow-hidden">
      {/* Final CTA Section */}
      <section className="px-6 md:px-12 py-20 max-w-[1280px] mx-auto border-b-2 border-background/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-background">
            READY TO<br />VANISH?
          </h2>
          <div className="w-full md:w-auto">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); }}
              className="inline-block w-full md:w-auto bg-[#FF4F00] text-white px-16 py-8 font-black text-2xl md:text-4xl uppercase border-4 border-background hover:bg-background hover:text-foreground hover:border-[#FF4F00] transition-all duration-150 cursor-pointer text-center rounded-none"
            >
              <TextScramble text="ENTER XOCHAT" autostart={false} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer Links Grid */}
      <div className="grid grid-cols-4 md:grid-cols-12 gap-6 px-6 md:px-12 py-12 max-w-[1280px] mx-auto text-background">
        <div className="col-span-4 md:col-span-6">
          <div className="font-black text-xl uppercase tracking-widest mb-3 text-background">
            XOCHAT
          </div>
          <p className="text-sm text-background/60 max-w-xs font-medium">
            Built on the foundations of architectural structuralism and cryptographic freedom.
          </p>
        </div>

        <div className="col-span-2 md:col-span-2 space-y-2">
          <h4 className="text-xs font-black uppercase tracking-widest text-[#FF4F00] mb-4">Protocol</h4>
          <a className="block text-sm font-semibold text-background/60 hover:text-background transition-colors" href="#">Privacy</a>
          <a className="block text-sm font-semibold text-background/60 hover:text-background transition-colors" href="#">Terms</a>
        </div>

        <div className="col-span-2 md:col-span-2 space-y-2">
          <h4 className="text-xs font-black uppercase tracking-widest text-[#FF4F00] mb-4">Source</h4>
          <a className="block text-sm font-semibold text-background/60 hover:text-background transition-colors" href="https://github.com" target="_blank" rel="noopener noreferrer">Github</a>
          <a className="block text-sm font-semibold text-background/60 hover:text-background transition-colors" href="#">Docs</a>
        </div>

        <div className="col-span-4 md:col-span-2 space-y-2">
          <h4 className="text-xs font-black uppercase tracking-widest text-[#FF4F00] mb-4">Network</h4>
          <a className="block text-sm font-semibold text-background/60 hover:text-background transition-colors" href="#">Contact</a>
          <a className="block text-sm font-semibold text-background/60 hover:text-background transition-colors" href="#">Status</a>
        </div>

        <div className="col-span-4 md:col-span-12 pt-8 border-t border-background/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-background/50">© {new Date().getFullYear()} XOCHAT. BUILT ON STRUCTURE.</span>
          <span className="font-mono text-xs font-bold text-[#FF4F00]">v1.0.4-STABLE</span>
        </div>
      </div>
    </footer>
  );
}
