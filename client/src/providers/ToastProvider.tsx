'use client';
// ──────────────────────────────────────────────
// XOChat — Toast Provider
// ──────────────────────────────────────────────
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '@/stores/uiStore';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  error: 'border-red-500/30 bg-red-500/10 text-red-300',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useUIStore();

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const Icon = iconMap[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl ${colorMap[toast.type]}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium flex-1">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 p-0.5 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
