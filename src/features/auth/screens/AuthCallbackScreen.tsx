import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import type { Session } from '@supabase/supabase-js';
import { useAppTheme, type ThemeColors } from '@/theme';
import { createSessionFromUrl, getAuthCallbackError } from '@/lib/auth/redirects';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthStateHandler, type AlertData } from '@/features/auth/screens/AuthStateHandler';

// ── Styles (container only — sub-component styles live in AuthStateHandler) ───

const createStyles = (colors: ThemeColors) =>
  ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
  }) as const;

// ── Screen ───────────────────────────────────────────────────────────────────

export default function AuthCallbackScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const incomingUrl = Linking.useURL();
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const hasHandledUrlRef = useRef<string | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState<AlertData | null>(null);
  const [countdown, setCountdown] = useState(4);

  const cleanup = useCallback(() => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
  }, []);

  const scheduleRedirect = useCallback(
    (destination: '/(tabs)' | '/(onboarding)/welcome', seconds: number) => {
      cleanup();
      setCountdown(seconds);
      redirectTimerRef.current = setTimeout(() => {
        router.replace(destination);
      }, seconds * 1000);
    },
    [cleanup, router],
  );

  const handleAuthSuccess = useCallback(
    async (session: Session) => {
      useAuthStore.setState({
        session,
        isAuthenticated: true,
        isDemoSession: false,
      });

      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }

      await refreshProfile();

      const onboardingComplete = useAuthStore.getState().user?.onboarding_complete;

      setAlertState({
        open: true,
        title: 'Signed in successfully',
        message: onboardingComplete
          ? 'Redirecting to your dashboard...'
          : 'Account ready. Setting up your profile...',
        variant: 'default',
        action: {
          label: 'Continue',
          onPress: () => {
            cleanup();
            router.replace(onboardingComplete ? '/(tabs)' : '/(onboarding)/welcome');
          },
        },
      });

      setLoading(false);

      scheduleRedirect(onboardingComplete ? '/(tabs)' : '/(onboarding)/welcome', 4);
    },
    [cleanup, refreshProfile, scheduleRedirect, router],
  );

  const handleCallback = useCallback(async () => {
    const url = incomingUrl;
    if (!url) return;
    if (hasHandledUrlRef.current === url) return;
    hasHandledUrlRef.current = url;

    cleanup();
    setLoading(true);

    const authCallbackError = getAuthCallbackError(url);
    if (authCallbackError) {
      setAlertState({
        open: true,
        title: 'Authentication Error',
        message: authCallbackError,
        variant: 'destructive',
        cancel: {
          label: 'Back to Login',
          onPress: () => router.replace('/(auth)/login'),
        },
      });
      setLoading(false);
      return;
    }

    try {
      let session: Session | null = null;

      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData?.session?.user?.id) {
        session = sessionData.session;
      } else if (url.includes('token') || url.includes('code')) {
        const sessionResult = await createSessionFromUrl(url);

        if (!sessionResult.success) {
          setAlertState({
            open: true,
            title: 'Authentication Error',
            message: sessionResult.message,
            variant: 'destructive',
            cancel: {
              label: 'Back to Login',
              onPress: () => router.replace('/(auth)/login'),
            },
          });
          setLoading(false);
          return;
        }

        const { data: refreshed } = await supabase.auth.getSession();
        session = refreshed?.session ?? null;
      }

      if (!session?.user?.id) {
        setAlertState({
          open: true,
          title: 'Authentication Error',
          message: 'The sign-in session was not available. Please check your email and try again.',
          variant: 'destructive',
          cancel: {
            label: 'Back to Login',
            onPress: () => router.replace('/(auth)/login'),
          },
        });
        setLoading(false);
        return;
      }

      await handleAuthSuccess(session);
    } catch (error) {
      logger.error('Auth callback error', error);
      setAlertState({
        open: true,
        title: 'Authentication Error',
        message: 'An unexpected error occurred while finishing sign-in. Please try again.',
        variant: 'destructive',
        cancel: {
          label: 'Back to Login',
          onPress: () => router.replace('/(auth)/login'),
        },
      });
      setLoading(false);
    }
  }, [incomingUrl, cleanup, handleAuthSuccess, router]);

  useEffect(() => {
    if (incomingUrl) {
      handleCallback();
    }
  }, [incomingUrl, handleCallback]);

  useEffect(() => {
    let cancelled = false;

    async function handleAutoDetectedSession() {
      if (hasHandledUrlRef.current) return;

      const { data } = await supabase.auth.getSession();
      if (cancelled || !data.session?.user?.id) return;

      hasHandledUrlRef.current = 'auto-detected';
      cleanup();
      await handleAuthSuccess(data.session);
    }

    void handleAutoDetectedSession();
    return () => {
      cancelled = true;
    };
    // Only run on mount — no deps needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!incomingUrl && loading) {
      const timeout = setTimeout(() => {
        if (!hasHandledUrlRef.current) {
          setAlertState({
            open: true,
            title: 'No sign-in link detected',
            message:
              'If you opened an email link, make sure it opened in the Navya app. You can request a new link from the login screen.',
            variant: 'destructive',
            cancel: {
              label: 'Back to Login',
              onPress: () => router.replace('/(auth)/login'),
            },
          });
          setLoading(false);
        }
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [incomingUrl, loading, router]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  function handleAlertOpenChange(open: boolean) {
    if (!open && alertState) {
      cleanup();
      if (alertState.variant === 'destructive') {
        router.replace('/(auth)/login');
      } else {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        router.replace(isAuthenticated ? '/(tabs)/profile' : '/(auth)/login');
      }
    }
  }

  function handleContinue() {
    cleanup();
    const isAuthenticated = useAuthStore.getState().isAuthenticated;
    router.replace(isAuthenticated ? '/(tabs)/profile' : '/(auth)/login');
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <AuthStateHandler
        loading={loading}
        alertState={alertState}
        countdown={countdown}
        colors={colors}
        onAlertOpenChange={handleAlertOpenChange}
        onContinue={handleContinue}
      />
    </View>
  );
}
