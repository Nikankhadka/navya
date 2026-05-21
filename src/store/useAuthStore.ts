import { create } from 'zustand';
import type { UserProfile } from '@/types/app';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { profileService } from '@/features/profile/api/profile.service';
import { MOCK_PROFILE } from '@/features/demo/mockData';
import { getVisualTestSessionMode } from '@/utils/visualTest';

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
  enterDemoMode: (options?: { onboardingComplete?: boolean }) => void;
  signInWithEmailPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmailPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

let authInitPromise: Promise<void> | null = null;
let hasRegisteredAuthListener = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,
  isDemoSession: false,

  setLoading: (isLoading) => set({ isLoading }),

  enterDemoMode: (options) =>
    set({
      user: {
        ...MOCK_PROFILE,
        onboarding_complete: options?.onboardingComplete ?? true,
      },
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
    if (get().isInitialized) return;

    if (authInitPromise) {
      await authInitPromise;
      return;
    }

    authInitPromise = (async () => {
      try {
        set({ isLoading: true });

        const visualTestMode = getVisualTestSessionMode();

        if (visualTestMode) {
          get().enterDemoMode({
            onboardingComplete: visualTestMode === 'demo-tabs',
          });
          return;
        }

        if (!hasRegisteredAuthListener) {
          supabase.auth.onAuthStateChange((_event, newSession) => {
            set({
              session: newSession,
              isAuthenticated: !!newSession,
              isDemoSession: false,
            });

            if (newSession) {
              void get().refreshProfile().catch((error) => {
                logger.error('Profile refresh after auth change failed', error);
              });
            } else {
              set({ user: null });
            }
          });
          hasRegisteredAuthListener = true;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        set({
          session,
          isAuthenticated: !!session,
          isDemoSession: false,
        });

        if (session) {
          await get().refreshProfile();
        }
      } catch (error) {
        logger.error('Auth initialization error', error);
      } finally {
        set({ isLoading: false, isInitialized: true });
        authInitPromise = null;
      }
    })();

    await authInitPromise;
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
      logger.error('Sign out error', error);
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

  signInWithEmailPassword: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      logger.error('Email/password sign in failed', error);
      return { success: false, error: 'Unable to sign in. Please try again.' };
    } finally {
      set({ isLoading: false });
    }
  },

  signUpWithEmailPassword: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${process.env.EXPO_PUBLIC_APP_URL ?? 'navya://'}auth/callback`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      logger.error('Email/password sign up failed', error);
      return { success: false, error: 'Unable to create account. Please try again.' };
    } finally {
      set({ isLoading: false });
    }
  },
}));
