import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme, ToastProvider } from 'tamagui';
import { queryClient } from '@/config/queryClient';
import { WebWrapper } from '@/components/layout/WebWrapper';
import { AppThemeProvider, useAppTheme } from '@/theme';
import { tamaguiConfig } from '../../tamagui.config';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <ThemedAppProviders>{children}</ThemedAppProviders>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}

function ThemedAppProviders({ children }: PropsWithChildren) {
  const { isDark, resolvedTheme } = useAppTheme();

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={resolvedTheme}>
      <Theme name={resolvedTheme}>
        <ToastProvider>
          <SafeAreaProvider>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <WebWrapper>{children}</WebWrapper>
          </SafeAreaProvider>
        </ToastProvider>
      </Theme>
    </TamaguiProvider>
  );
}
