'use client';
import React from 'react';
import { Shield, Bolt, PersonStanding, EyeOff } from 'lucide-react';

export function Features() {
  return (
    <div id="features" className="bg-background text-foreground font-sans selection:bg-[#FF4F00] selection:text-white">
      
      {/* Philosophy Section */}
      <section className="px-6 md:px-12 py-20 max-w-[1280px] mx-auto border-t-2 border-border">
        <div className="grid grid-cols-4 md:grid-cols-12 gap-6">
          <div className="col-span-4 md:col-span-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-[#FF4F00] mb-3">The Philosophy</h2>
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-foreground">WHY XOCHAT?</h3>
          </div>
          <div className="col-span-4 md:col-span-8 space-y-12">
            <div className="border-b border-border pb-8">
              <span className="font-mono text-xs font-bold text-[#FF4F00]">01 /</span>
              <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground mt-2 mb-3">NO METADATA RETENTION</h4>
              <p className="text-sm md:text-base text-foreground/60 font-medium leading-relaxed max-w-2xl">
                We don&apos;t just encrypt your messages; we ignore their existence. No logs, no timestamps, no identity links stored centrally.
              </p>
            </div>
            
            <div className="border-b border-border pb-8">
              <span className="font-mono text-xs font-bold text-[#FF4F00]">02 /</span>
              <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground mt-2 mb-3">EPHEMERAL ARCHITECTURE</h4>
              <p className="text-sm md:text-base text-foreground/60 font-medium leading-relaxed max-w-2xl">
                Information lives in the moment. Sessions dissolve upon browser closing or deletion requests. Digital permanence is a core security vulnerability.
              </p>
            </div>

            <div className="border-b border-border pb-8">
              <span className="font-mono text-xs font-bold text-[#FF4F00]">03 /</span>
              <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground mt-2 mb-3">SWISS PRECISION</h4>
              <p className="text-sm md:text-base text-foreground/60 font-medium leading-relaxed max-w-2xl">
                Built strictly on the principles of Swiss design: objective typography, robust column layout alignments, and raw structural efficiency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Network Stats Banner */}
      <section className="bg-foreground text-background py-16 border-t-2 border-border select-none">
        <div className="px-6 md:px-12 max-w-[1280px] mx-auto">
          <div className="grid grid-cols-4 md:grid-cols-12 gap-6">
            <div className="col-span-4 md:col-span-12 mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-[#FF4F00]">Network Status</h2>
            </div>
            <div className="col-span-4 md:col-span-4 border-l border-background/20 pl-6 py-4">
              <div className="font-mono text-4xl md:text-5xl font-bold mb-2">14,209</div>
              <div className="text-[10px] uppercase tracking-widest text-background/80">Active Nodes</div>
            </div>
            <div className="col-span-4 md:col-span-4 border-l border-background/20 pl-6 py-4">
              <div className="font-mono text-4xl md:text-5xl font-bold mb-2">12ms</div>
              <div className="text-[10px] uppercase tracking-widest text-background/80">Network Latency</div>
            </div>
            <div className="col-span-4 md:col-span-4 border-l border-background/20 pl-6 py-4">
              <div className="font-mono text-4xl md:text-5xl font-bold mb-2">v4.2.0</div>
              <div className="text-[10px] uppercase tracking-widest text-background/80">Protocol Version</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="bg-foreground text-background py-20 border-t border-border/10">
        <div className="px-6 md:px-12 max-w-[1280px] mx-auto">
          <div className="grid grid-cols-4 md:grid-cols-12 gap-6">
            {/* Bento Card 1 */}
            <div className="col-span-4 md:col-span-8 border-2 border-border p-8 flex flex-col justify-between min-h-[350px] group transition-all duration-300 hover:bg-background/5 rounded-none">
              <div>
                <Shield className="w-12 h-12 mb-6 text-background group-hover:text-[#FF4F00] transition-colors" />
                <h3 className="text-3xl md:text-5xl font-black uppercase leading-none tracking-tight">MILITARY GRADE<br />ENCRYPTION</h3>
              </div>
              <p className="text-sm md:text-base text-background/80 max-w-md font-medium">
                End-to-end local encryption protocols ensuring even the communication network nodes cannot read or analyze payload headers.
              </p>
            </div>

            {/* Bento Card 2 */}
            <div className="col-span-4 md:col-span-4 border-2 border-[#FF4F00] p-8 bg-[#FF4F00] text-white flex flex-col justify-between min-h-[350px] group transition-all duration-300 hover:scale-[1.01] rounded-none">
              <div>
                <Bolt className="w-12 h-12 mb-6 text-white" />
                <h3 className="text-3xl font-black uppercase leading-none tracking-tight">INSTANT<br />SOCKETS</h3>
              </div>
              <p className="text-sm font-semibold">
                Real-time connection handshake using Socket.IO without centralized databases archiving your communication logs.
              </p>
            </div>

            {/* Bento Card 3 */}
            <div className="col-span-4 md:col-span-4 border-2 border-border p-8 flex flex-col justify-between min-h-[350px] group transition-all duration-300 hover:bg-background/5 rounded-none">
              <div>
                <EyeOff className="w-12 h-12 mb-6 text-background group-hover:text-[#FF4F00] transition-colors" />
                <h3 className="text-3xl font-black uppercase leading-none tracking-tight">EPHEMERAL<br />CLEANUP</h3>
              </div>
              <p className="text-sm text-background/80 font-medium">
                Automatic rate-limited sweeps automatically clean inactive credentials and unutilized communication history slots.
              </p>
            </div>

            {/* Bento Card 4 (Raw brutalist architectural image mockup) */}
            <div className="col-span-4 md:col-span-8 relative overflow-hidden border-2 border-border min-h-[300px] group rounded-none">
              <div 
                className="absolute inset-0 bg-cover bg-center grayscale contrast-125 transition-transform duration-700 group-hover:scale-105"
                style={{ 
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBQhPbmDKCQzVS7CygN3J-OFlSmIV2vEjK4UiuC-7YuWU7zooMU4d59DwSZZsUNnUbgd5Nwy-9p9u5wlW5-PlDG_pU_O6NJYTAJ1YaWSEh0LWkJ6KEn9CWczF2rJHwYEIv1IKc5IzPFgLMKEUzygqMl40yTh9lszRMSX97sYB9h-42G9NiURXs8wq_zO2Dlw04PXYgPt1FQ70eJ7Ahuje7izcC0gHhAUdMCRELjRNoUo0-kyRgyMDmIfQ')` 
                }}
              />
              <div className="absolute inset-0 bg-[#FF4F00]/10 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-6 left-6 bg-surface text-foreground px-4 py-2 font-mono text-xs uppercase tracking-widest font-black border border-border rounded-none">
                Visual Node: 0x82FA
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
