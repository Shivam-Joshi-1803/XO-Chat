'use client';
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { IconSwap } from './IconSwap';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function CopyButton({ textToCopy, className = '', size = 'md' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';
  const padding = size === 'sm' ? 'p-1.5 rounded-md' : 'p-2.5 rounded-xl';

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center justify-center bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer ${padding} ${className}`}
      title="Copy to clipboard"
    >
      <IconSwap
        state={copied}
        defaultIcon={<Copy className={`${iconSize}`} />}
        activeIcon={<Check className={`${iconSize} text-emerald-400`} />}
      />
    </button>
  );
}
