'use client';
import React, { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';
import { UsernameModal } from '@/components/auth/UsernameModal';
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { fetchUser, isAuthenticated, isLoading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/chat');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-border border-t-primary rounded-none animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest text-foreground">Loading XOChat...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#FF4F00] selection:text-white">
      <Navbar />
      <SmoothScrollProvider>
        <main>
          <section data-scroll-section>
            <Hero />
          </section>
          <section data-scroll-section>
            <Features />
          </section>
          <section data-scroll-section>
            <FAQ />
          </section>
        </main>
        <section data-scroll-section>
          <Footer />
        </section>
      </SmoothScrollProvider>
      <UsernameModal />
    </div>
  );
}
