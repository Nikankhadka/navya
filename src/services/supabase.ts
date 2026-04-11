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
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }

  return makeRedirectUri({
    scheme: 'navya',
    native: 'navya://auth/callback',
    path: 'auth/callback',
  });
}

type AuthCallbackParams = {
  accessToken?: string;
  refreshToken?: string;
  code?: string;
  errorCode?: string;
  errorDescription?: string;
};

function readUrlParams(url: string): URLSearchParams {
  const parsed = Linking.parse(url);
  const params = new URLSearchParams();

  Object.entries(parsed.queryParams ?? {}).forEach(([key, value]) => {
    if (typeof value === 'string') {
      params.set(key, value);
    }
  });

  if (url.includes('#')) {
    const fragment = url.split('#')[1] ?? '';
    const fragmentParams = new URLSearchParams(fragment);
    fragmentParams.forEach((value, key) => {
      params.set(key, value);
    });
  }

  return params;
}

function extractSessionParams(url: string): AuthCallbackParams {
  const params = readUrlParams(url);
  const parsed = Linking.parse(url);

  return {
    accessToken: params.get('access_token') ?? undefined,
    refreshToken: params.get('refresh_token') ?? undefined,
    code: params.get('code') ?? undefined,
    errorCode:
      params.get('error_code') ??
      params.get('error') ??
      (typeof parsed.queryParams?.error_code === 'string' ? parsed.queryParams.error_code : undefined) ??
      undefined,
    errorDescription: params.get('error_description') ?? undefined,
  };
}

export function getAuthCallbackError(url: string): string | null {
  const { errorCode, errorDescription } = extractSessionParams(url);

  if (!errorCode) {
    return null;
  }

  if (errorCode === 'otp_expired') {
    return 'That sign-in link is invalid or has expired. Request a new magic link and open the newest email on the same device.';
  }

  if (errorDescription) {
    return decodeURIComponent(errorDescription.replace(/\+/g, ' '));
  }

  return 'Authentication could not be completed. Please try again.';
}

export async function createSessionFromUrl(url: string): Promise<boolean> {
  const { accessToken, refreshToken, code, errorCode } = extractSessionParams(url);

  if (errorCode) {
    return false;
  }

  if (!accessToken || !refreshToken) {
    if (!code) {
      return false;
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Code exchange failed:', error.message);
      return false;
    }

    return true;
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
