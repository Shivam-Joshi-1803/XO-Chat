'use client';
// ──────────────────────────────────────────────
// XOChat — User Store (Zustand)
// ──────────────────────────────────────────────
import { create } from 'zustand';
import type { User } from '@/types';
import { api } from '@/lib/api';

interface UserState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => {
    if (typeof window !== 'undefined' && user?.session_token) {
      sessionStorage.setItem('xo_session_token', user.session_token);
    }
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  fetchUser: async () => {
    set({ isLoading: true });

    // Skip API call if no session cookie exists — prevents 401 console error
    if (typeof document !== 'undefined') {
      const hasSession = document.cookie.split(';').some((c) => c.trim().startsWith('xo_session='));
      if (!hasSession) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
    }

    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        if (typeof window !== 'undefined' && res.data.session_token) {
          sessionStorage.setItem('xo_session_token', res.data.session_token);
        }
        set({ user: res.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('xo_session_token');
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
