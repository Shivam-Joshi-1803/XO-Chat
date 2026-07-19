'use client';
import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { TextScramble } from '@/components/ui/TextScramble';

export function Navbar() {
  const { setShowUsernameModal } = useUIStore();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      setTheme(activeTheme);
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('xo_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    const el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className="w-full top-0 sticky z-50 bg-background/90 backdrop-blur-md border-b-2 border-border transition-all">
      <div className="flex justify-between items-center w-full px-3 xs:px-6 md:px-12 py-3 xs:py-4 max-w-[1280px] mx-auto">
        {/* Brand */}
        <Link 
          href="/" 
          onClick={handleBrandClick}
          className="font-sans text-[20px] xs:text-[28px] md:text-[32px] font-black tracking-tighter text-foreground select-none hover:text-[#FF4F00] transition-colors"
        >
          <TextScramble text="XOCHAT" autostart={true} />
        </Link>

        {/* Center / Right Links */}
        <div className="flex items-center gap-2 xs:gap-4 md:gap-10">
          <div className="hidden md:flex gap-8 items-center">
            <a 
              href="#features" 
              onClick={(e) => handleScrollTo(e, '#features')}
              className="text-xs font-semibold uppercase tracking-widest text-foreground hover:text-[#FF4F00] transition-colors duration-150"
            >
              Features
            </a>
            <a 
              href="#faq" 
              onClick={(e) => handleScrollTo(e, '#faq')}
              className="text-xs font-semibold uppercase tracking-widest text-foreground hover:text-[#FF4F00] transition-colors duration-150"
            >
              FAQ
            </a>
            <Link 
              href="/recover" 
              className="text-xs font-semibold uppercase tracking-widest text-foreground hover:text-[#FF4F00] transition-colors duration-150"
            >
              Recover
            </Link>
          </div>

          <div className="flex items-center gap-1.5 xs:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={handleToggleTheme}
              className="p-2 xs:p-2.5 border-2 border-border bg-surface text-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer rounded-none"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowUsernameModal(true)}
              className="bg-foreground text-background px-3 py-2 text-[10px] xs:px-6 xs:py-3 xs:text-xs uppercase tracking-widest font-black hover:bg-[#FF4F00] hover:text-white transition-colors duration-150 cursor-pointer rounded-none border border-border"
            >
              <TextScramble text="Claim Username" autostart={false} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
