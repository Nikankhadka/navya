import { create } from 'zustand';
import type { UserProfile } from '../types/app';
import { MOCK_PROFILE } from '../lib/mockData';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
  // For dev: mock sign-in
  mockSignIn: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: user !== null }),

  setLoading: (isLoading) => set({ isLoading }),

  signOut: () =>
    set({ user: null, isAuthenticated: false }),

  // Dev-only: bypass auth with mock data
  mockSignIn: () =>
    set({ user: MOCK_PROFILE, isAuthenticated: true }),
}));
