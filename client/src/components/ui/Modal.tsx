'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />

          {/* Modal — Swiss brutalist box with hard offset shadow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`
              relative w-full ${sizeClasses[size]}
              bg-surface
              border-2 border-border
              brutalist-shadow
              overflow-hidden rounded-none
              max-h-[90vh] flex flex-col
            `}
          >
            {/* Header */}
            {(title || description) && (
              <div className="px-6 pt-6 pb-4 border-b-2 border-border">
                <div className="flex items-start justify-between">
                  {title && (
                    <h2 className="text-base font-black uppercase tracking-widest text-foreground">{title}</h2>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-foreground hover:text-background text-foreground transition-colors rounded-none border border-transparent hover:border-border cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {description && (
                  <p className="text-xs font-medium text-foreground/50 mt-1.5 uppercase tracking-wider">{description}</p>
                )}
              </div>
            )}

            {/* Content */}
            <div className="px-4 pb-5 pt-3 bg-surface overflow-y-auto flex-1">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
