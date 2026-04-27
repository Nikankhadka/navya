import '../../global.css';
import { Stack } from 'expo-router';
import { AppProviders } from '@/providers/AppProviders';
import { AuthGate } from '@/providers/AuthGate';

export default function RootLayout() {
  return (
    <AppProviders>
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      </Stack>
    </AppProviders>
  );
}
