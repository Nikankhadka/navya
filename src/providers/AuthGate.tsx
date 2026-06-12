import { useEffect, type PropsWithChildren } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppTheme } from '@/theme';

export function AuthGate({ children }: PropsWithChildren) {
  const { colors } = useAppTheme();
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const isProfileReady = useAuthStore((s) => s.isProfileReady);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const onboardingComplete = useAuthStore((s) => s.user?.onboarding_complete);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isInitialized || !isProfileReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (!isAuthenticated) return;

    if (!onboardingComplete && !inOnboardingGroup) {
      router.replace('/(onboarding)/welcome');
      return;
    }

    if (onboardingComplete && inAuthGroup) {
      router.replace('/(tabs)');
      return;
    }

    if (onboardingComplete && inOnboardingGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isInitialized, isProfileReady, onboardingComplete, router, segments]);

  if (!isInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return <>{children}</>;
}
