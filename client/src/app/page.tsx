import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';
import { UsernameModal } from '@/components/auth/UsernameModal';
import { AuthRedirect } from '@/components/auth/AuthRedirect';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#FF4F00] selection:text-white">
      <AuthRedirect />
      <Navbar />
      <main>
        <section>
          <Hero />
        </section>
        <section>
          <Features />
        </section>
        <section>
          <FAQ />
        </section>
      </main>
      <section>
        <Footer />
      </section>
      <UsernameModal />
    </div>
  );
}

