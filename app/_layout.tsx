import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../src/stores/useAuthStore';
import { WebWrapper } from '../src/components/ui/WebWrapper';
import { View, ActivityIndicator } from 'react-native';

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

  // Initialize auth exactly once
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Auth Guard
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not logged in, trying to access protected route
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Logged in, trying to access auth screens
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isInitialized, segments, router]);

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#fff" />
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
          </Stack>
        </WebWrapper>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
