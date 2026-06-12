import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppTheme } from '@/theme';

export function AuthGate() {
  const { colors } = useAppTheme();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isProfileReady = useAuthStore((state) => state.isProfileReady);
  const onboardingComplete = useAuthStore((state) => state.user?.onboarding_complete);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isProfileReady) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    if (!onboardingComplete && !inOnboardingGroup) {
      router.replace('/(onboarding)/welcome');
      return;
    }

    if ((onboardingComplete || inOnboardingGroup) && inAuthGroup) {
      router.replace('/(tabs)');
      return;
    }

    if (onboardingComplete && inOnboardingGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isInitialized, isProfileReady, onboardingComplete, router, segments]);

  if (isInitialized) {
    return null;
  }

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
