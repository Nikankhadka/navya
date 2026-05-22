import { Stack } from 'expo-router';
import { ToastViewport } from 'tamagui';
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
      <ToastViewport top="$8" left={0} right={0} />
    </AppProviders>
  );
}
