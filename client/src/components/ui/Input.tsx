'use client';
import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, icon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-[10px] font-black uppercase tracking-widest text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
              {icon}
            </div>
          )}
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground font-black text-sm select-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            className={`
               w-full bg-surface border-2 border-border rounded-none
               px-4 py-2.5 text-sm text-foreground placeholder-foreground/30 font-medium
              focus:outline-none focus:border-[#FF4F00]
              transition-colors duration-150
              ${icon ? 'pl-10' : ''}
              ${prefix ? 'pl-8' : ''}
              ${error ? 'border-red-600 focus:border-red-600' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
