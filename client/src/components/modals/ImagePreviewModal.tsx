'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/stores/uiStore';
import { X, Download } from 'lucide-react';

export function ImagePreviewModal() {
  const { showImagePreview, setShowImagePreview } = useUIStore();

  const handleDownload = async () => {
    if (!showImagePreview) return;
    try {
      const response = await fetch(showImagePreview);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xo_chat_image_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download image:', err);
    }
  };

  return (
    <AnimatePresence>
      {showImagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90"
            onClick={() => setShowImagePreview(null)}
          />

          {/* Controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-3 bg-surface border-2 border-border text-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer rounded-none"
              title="Download image"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowImagePreview(null)}
              className="p-3 bg-surface border-2 border-border text-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer rounded-none"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Image Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative max-w-full max-h-[80vh] z-10 overflow-hidden rounded-none border-4 border-border bg-surface shadow-[8px_8px_0px_0px_#FF4F00]"
          >
            <img
              src={showImagePreview}
              alt="Preview"
              className="object-contain max-w-full max-h-[80vh] select-none"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
