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

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const res = await api.getMe();
      if (res.success && res.data) {
        set({ user: res.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
