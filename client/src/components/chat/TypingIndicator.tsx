'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  displayName: string;
}

export function TypingIndicator({ displayName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-[10px] text-black font-black uppercase tracking-widest select-none">
      <div className="flex items-center gap-1">
        <motion.span
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          className="w-1.5 h-1.5 bg-[#FF4F00]"
        />
        <motion.span
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
          className="w-1.5 h-1.5 bg-black"
        />
        <motion.span
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
          className="w-1.5 h-1.5 bg-black"
        />
      </div>
      <span>{displayName} is typing</span>
    </div>
  );
}
