'use client';
import React from 'react';

interface BadgeProps {
  count: number;
  className?: string;
}

export function Badge({ count, className = '' }: BadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={`
        inline-flex items-center justify-center
        min-w-[1.25rem] h-5 px-1.5
        text-[9px] font-black uppercase tracking-wider text-white
        bg-[#FF4F00]
        rounded-none
        ${className}
      `}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}
