import { create } from 'zustand';
import type { UserProfile } from '../types/app';
import { supabase } from '../services/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  user: Partial<UserProfile> | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setProfile: (profile: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,

  setLoading: (isLoading) => set({ isLoading }),

  initializeAuth: async () => {
    try {
      if (get().isInitialized) return;
      
      set({ isLoading: true });

      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (session) {
        set({ session, isAuthenticated: true });
        // Fetch profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        set({ user: { ...profile, email: session.user.email, id: session.user.id } });
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (_event, newSession) => {
        set({ session: newSession, isAuthenticated: !!newSession });
        
        if (newSession) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
            
          set({ user: { ...profile, email: newSession.user.email, id: newSession.user.id } });
        } else {
          set({ user: null });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      set({ user: null, session: null, isAuthenticated: false, isLoading: false });
    }
  },

  setProfile: (profile) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...profile } });
    }
  },
}));
