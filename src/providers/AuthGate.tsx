import { useEffect } from 'react';
import { usePathname, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors } from '@/theme';

export function AuthGate() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingComplete = useAuthStore((state) => state.user?.onboarding_complete);
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inAuthCallbackRoute = pathname === '/auth/callback';

    if (inAuthCallbackRoute) {
      return;
    }

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
  }, [isAuthenticated, isInitialized, onboardingComplete, pathname, router, segments]);

  if (isInitialized) {
    return null;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg }}>
      <ActivityIndicator size="large" color={Colors.text} />
    </View>
  );
}
