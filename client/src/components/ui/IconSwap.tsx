'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IconSwapProps {
  state: boolean;
  defaultIcon: React.ReactNode;
  activeIcon: React.ReactNode;
  className?: string;
}

export function IconSwap({ state, defaultIcon, activeIcon, className = '' }: IconSwapProps) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 overflow-hidden ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={state ? 'active' : 'default'}
          initial={{ opacity: 0, scale: 0.7, filter: 'blur(3px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.7, filter: 'blur(3px)' }}
          transition={{ duration: 0.18, ease: 'easeInOut' }}
          className="flex items-center justify-center"
        >
          {state ? activeIcon : defaultIcon}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
