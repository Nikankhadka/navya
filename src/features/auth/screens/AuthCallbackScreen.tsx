import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import type { Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui';
import { Spacing, Typography, useAppTheme, type ThemeColors } from '@/theme';
import { createSessionFromUrl, getAuthCallbackError } from '@/lib/auth/redirects';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';

type CallbackState = 'loading' | 'success' | 'error';

export default function AuthCallbackScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const incomingUrl = Linking.useURL();
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const hasHandledUrlRef = useRef<string | null>(null);
  const [status, setStatus] = useState<CallbackState>('loading');
  const [message, setMessage] = useState('Navya is verifying your secure sign-in.');

  async function getSessionWithRetry(): Promise<Session | null> {
    const waitDurationsMs = [0, 150, 300, 600];

    for (const waitMs of waitDurationsMs) {
      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user.id) {
        return session;
      }
    }

    return null;
  }

  useEffect(() => {
    const currentUrl =
      incomingUrl ?? (typeof window !== 'undefined' ? window.location.href : null);

    if (!currentUrl || hasHandledUrlRef.current === currentUrl) {
      return;
    }

    const callbackUrl = currentUrl;
    hasHandledUrlRef.current = currentUrl;

    let isCancelled = false;
    let redirectTimer: ReturnType<typeof setTimeout> | null = null;

    async function completeAuth() {
      const authCallbackError = getAuthCallbackError(callbackUrl);

      if (authCallbackError) {
        if (!isCancelled) {
          setStatus('error');
          setMessage(authCallbackError);
        }
        return;
      }

      const sessionResult = await createSessionFromUrl(callbackUrl);
      const session = await getSessionWithRetry();

      if (!session?.user.id) {
        if (!isCancelled) {
          setStatus('error');
          setMessage(
            sessionResult.success
              ? 'The sign-in session was not available after callback completion. Please try again.'
              : sessionResult.message,
          );
        }
        return;
      }

      useAuthStore.setState({
        session,
        isAuthenticated: true,
        isDemoSession: false,
      });

      await refreshProfile();

      if (isCancelled) {
        return;
      }

      const onboardingComplete = useAuthStore.getState().user?.onboarding_complete;

      setStatus('success');
      setMessage(
        onboardingComplete
          ? 'Sign-in complete. Taking you to your dashboard.'
          : 'Sign-in complete. Taking you to onboarding.',
      );

      redirectTimer = setTimeout(() => {
        router.replace(onboardingComplete ? '/(tabs)' : '/(onboarding)/welcome');
      }, 600);
    }

    void completeAuth().catch((error) => {
      console.error('Auth callback error:', error);

      if (!isCancelled) {
        setStatus('error');
        setMessage('Navya hit an unexpected error while finishing sign-in. Please try again.');
      }
    });

    return () => {
      isCancelled = true;
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [incomingUrl, refreshProfile, router]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {status === 'loading' ? <ActivityIndicator size="large" color={colors.text} /> : null}
      <Text style={styles.title}>
        {status === 'success' ? 'Sign-in complete' : status === 'error' ? 'Sign-in issue' : 'Completing sign-in'}
      </Text>
      <Text style={styles.subtitle}>{message}</Text>
      {status === 'error' ? (
        <Button
          label="Back to Login"
          onPress={() => router.replace('/(auth)/login')}
          fullWidth
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.md,
      paddingHorizontal: Spacing.xl,
      backgroundColor: colors.background,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: Typography.weight.bold,
      textAlign: 'center',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 16,
      textAlign: 'center',
    },
    button: {
      marginTop: Spacing.sm,
      width: '100%',
    },
  });
