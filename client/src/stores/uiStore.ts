'use client';
// ──────────────────────────────────────────────
// XOChat — UI Store (Zustand)
// ──────────────────────────────────────────────
import { create } from 'zustand';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UIState {
  showUsernameModal: boolean;
  showNewChatModal: boolean;
  showSettingsModal: boolean;
  showProfileModal: boolean;
  showDeleteModal: boolean;
  showImagePreview: string | null;
  mobileSidebarOpen: boolean;
  toasts: Toast[];

  setShowUsernameModal: (show: boolean) => void;
  setShowNewChatModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowProfileModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  setShowImagePreview: (url: string | null) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

let toastId = 0;

export const useUIStore = create<UIState>((set) => ({
  showUsernameModal: false,
  showNewChatModal: false,
  showSettingsModal: false,
  showProfileModal: false,
  showDeleteModal: false,
  showImagePreview: null,
  mobileSidebarOpen: false,
  toasts: [],

  setShowUsernameModal: (show) => set({ showUsernameModal: show }),
  setShowNewChatModal: (show) => set({ showNewChatModal: show }),
  setShowSettingsModal: (show) => set({ showSettingsModal: show }),
  setShowProfileModal: (show) => set({ showProfileModal: show }),
  setShowDeleteModal: (show) => set({ showDeleteModal: show }),
  setShowImagePreview: (url) => set({ showImagePreview: url }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  addToast: (type, message) => {
    const id = `toast-${++toastId}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
