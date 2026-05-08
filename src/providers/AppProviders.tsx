import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import type { PropsWithChildren } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';
import { queryClient } from '@/config/queryClient';
import { WebWrapper } from '@/components/layout/WebWrapper';
import { tamaguiConfig } from '../../tamagui.config';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <Theme name="dark">
          <SafeAreaProvider>
            <StatusBar style="light" />
            <WebWrapper>{children}</WebWrapper>
          </SafeAreaProvider>
        </Theme>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
