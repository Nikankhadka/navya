import { create } from 'zustand';
import type { UserProfile } from '../types/app';
import { supabase } from '../services/supabase';
import type { Session } from '@supabase/supabase-js';
import { profileService } from '../services/profileService';
import { MOCK_PROFILE } from '../mocks/mockData';

interface AuthState {
  user: Partial<UserProfile> | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isDemoSession: boolean;

  // Actions
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setProfile: (profile: Partial<UserProfile>) => void;
  refreshProfile: () => Promise<void>;
  enterDemoMode: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,
  isDemoSession: false,

  setLoading: (isLoading) => set({ isLoading }),

  enterDemoMode: () =>
    set({
      user: MOCK_PROFILE,
      session: null,
      isAuthenticated: true,
      isInitialized: true,
      isDemoSession: true,
      isLoading: false,
    }),

  refreshProfile: async () => {
    if (get().isDemoSession) {
      set({ user: MOCK_PROFILE });
      return;
    }

    const session = get().session;

    if (!session?.user.id) {
      return;
    }

    const profile = await profileService.getProfile(session.user.id);

    if (profile) {
      set({ user: { ...profile, email: session.user.email, id: session.user.id } });
      return;
    }

    set({
      user: {
        id: session.user.id,
        email: session.user.email,
        onboarding_complete: false,
      },
    });
  },

  initializeAuth: async () => {
    try {
      if (get().isInitialized) return;
      
      set({ isLoading: true });

      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (session) {
        set({ session, isAuthenticated: true });
        await get().refreshProfile();
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        set({ session: newSession, isAuthenticated: !!newSession });
        
        if (newSession) {
          set({ isDemoSession: false });
          await get().refreshProfile();
        } else {
          set({ user: null, isDemoSession: false });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  signOut: async () => {
    if (get().isDemoSession) {
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isDemoSession: false,
        isLoading: false,
      });
      return;
    }

    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isDemoSession: false,
        isLoading: false,
      });
    }
  },

  setProfile: (profile) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...profile } });
    }
  },
}));
