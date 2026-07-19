'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary:
    'bg-foreground text-background border-2 border-border hover:bg-[#FF4F00] hover:border-[#FF4F00] hover:text-white font-black uppercase tracking-widest',
  secondary:
    'bg-surface text-foreground border-2 border-border hover:bg-foreground hover:text-background font-bold uppercase tracking-widest',
  danger:
    'bg-surface text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white font-bold uppercase tracking-widest',
  ghost: 'bg-transparent text-foreground border-2 border-transparent hover:border-border font-bold uppercase tracking-widest',
};

const sizes = {
  sm: 'px-4 py-2 text-[10px]',
  md: 'px-6 py-3 text-xs',
  lg: 'px-10 py-4 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.99 }}
      transition={{ duration: 0.1 }}
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-150 cursor-pointer rounded-none
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
