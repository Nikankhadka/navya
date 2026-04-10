import '../global.css';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/stores/useAuthStore';
import { WebWrapper } from '../src/components/ui/WebWrapper';
import { View, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { Colors } from '../src/constants/theme';
import { createSessionFromUrl } from '../src/services/supabase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const { initializeAuth, isInitialized, isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const incomingUrl = Linking.useURL();

  // Initialize auth exactly once
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!incomingUrl) return;
    createSessionFromUrl(incomingUrl).catch((error) => {
      console.error('Deep link auth error:', error);
    });
  }, [incomingUrl]);

  // Auth Guard
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const onboardingComplete = useAuthStore.getState().user?.onboarding_complete;

    if (!isAuthenticated && !inAuthGroup) {
      // Not logged in, trying to access protected route
      router.replace('/(auth)/login');
    } else if (isAuthenticated) {
      if (!onboardingComplete && !inOnboardingGroup) {
        // Logged in but profile incomplete → onboarding
        router.replace('/(onboarding)/welcome');
      } else if ((onboardingComplete || inOnboardingGroup) && inAuthGroup) {
        // Logged in and already past auth → tabs (if onboarding complete)
        router.replace('/(tabs)');
      } else if (onboardingComplete && inOnboardingGroup) {
        // Back-button or direct access to onboarding while complete → tabs
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isInitialized, segments, router]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator size="large" color={Colors.text} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <WebWrapper>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          </Stack>
        </WebWrapper>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
