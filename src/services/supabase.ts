import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import type { Database } from '../types/supabase';

// ─── Secure storage adapter ───────────────────────────────────────────────────
// On web, SecureStore is not available — fall back to in-memory storage
const inMemoryStorage: Record<string, string> = {};

const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return inMemoryStorage[key] ?? null;
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      inMemoryStorage[key] = value;
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      delete inMemoryStorage[key];
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// ─── Supabase client ──────────────────────────────────────────────────────────
const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  'https://placeholder.supabase.co';

const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'placeholder-anon-key';

const demoModeFlag =
  Constants.expoConfig?.extra?.enableDemoMode ??
  process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE ??
  'false';

export const isSupabaseConfigured =
  !supabaseUrl.includes('placeholder') && supabaseAnonKey !== 'placeholder-anon-key';

export const isDemoModeAvailable = demoModeFlag === 'true' || !isSupabaseConfigured;

export function getAuthRedirectUrl(): string {
  return makeRedirectUri({
    native: 'navya://auth/callback',
    path: 'auth/callback',
  });
}

function extractSessionParams(url: string): { accessToken?: string; refreshToken?: string } {
  const parsed = Linking.parse(url);
  const queryParams = parsed.queryParams ?? {};
  const accessToken =
    typeof queryParams.access_token === 'string' ? queryParams.access_token : undefined;
  const refreshToken =
    typeof queryParams.refresh_token === 'string' ? queryParams.refresh_token : undefined;

  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }

  if (!url.includes('#')) {
    return {};
  }

  const fragment = url.split('#')[1] ?? '';
  const fragmentParams = new URLSearchParams(fragment);

  return {
    accessToken: fragmentParams.get('access_token') ?? undefined,
    refreshToken: fragmentParams.get('refresh_token') ?? undefined,
  };
}

export async function createSessionFromUrl(url: string): Promise<boolean> {
  const { accessToken, refreshToken } = extractSessionParams(url);

  if (!accessToken || !refreshToken) {
    return false;
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    console.error('Session creation failed:', error.message);
    return false;
  }

  return true;
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
