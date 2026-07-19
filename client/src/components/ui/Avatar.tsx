'use client';
import React from 'react';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-[9px]',
  md: 'w-10 h-10 text-[10px]',
  lg: 'w-12 h-12 text-xs',
  xl: 'w-16 h-16 text-sm',
};

const dotSizes = {
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-3.5 h-3.5 border-2',
};

export function Avatar({ src, name, size = 'md', online, className = '' }: AvatarProps) {
  const initials = name
    .split(/[\s_.]/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`relative shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size]} object-cover border-2 border-border rounded-none`}
        />
      ) : (
        <div
          className={`
            ${sizeClasses[size]} rounded-none
            bg-foreground
            flex items-center justify-center font-black text-background
            border-2 border-border
          `}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <div
          className={`
            absolute bottom-0 right-0
            ${dotSizes[size]} rounded-none
            border-background
            ${online ? 'bg-[#FF4F00]' : 'bg-foreground/50'}
          `}
        />
      )}
    </div>
  );
}
