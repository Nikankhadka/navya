import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { createSessionFromUrl, getAuthCallbackError } from '@/lib/auth/redirects';
import { Colors } from '@/theme';

export function AuthGate() {
  const { initializeAuth, isInitialized, isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const incomingUrl = Linking.useURL();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!incomingUrl) {
      return;
    }

    const authCallbackError = getAuthCallbackError(incomingUrl);

    if (authCallbackError) {
      Alert.alert('Sign-in link issue', authCallbackError);
      router.replace('/(auth)/login');
      return;
    }

    createSessionFromUrl(incomingUrl).catch((error) => {
      console.error('Deep link auth error:', error);
    });
  }, [incomingUrl, router]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const onboardingComplete = useAuthStore.getState().user?.onboarding_complete;

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
  }, [isAuthenticated, isInitialized, segments, router]);

  if (isInitialized) {
    return null;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg }}>
      <ActivityIndicator size="large" color={Colors.text} />
    </View>
  );
}
