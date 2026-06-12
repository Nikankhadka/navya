import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from '@/config/env';
import type { Database } from '@/types/database';

const inMemoryStorage: Record<string, string> = {};
const isBrowserWeb = process.env.EXPO_OS === 'web' && typeof window !== 'undefined';
const shouldAutoRefreshToken = process.env.EXPO_OS !== 'web' || isBrowserWeb;

function getWebStorage(): Storage | null {
  if (process.env.EXPO_OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.warn('Local storage unavailable, falling back to in-memory auth storage.', error);
    return null;
  }
}

const SecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const webStorage = getWebStorage();

    if (webStorage) {
      return webStorage.getItem(key) ?? inMemoryStorage[key] ?? null;
    }

    if (process.env.EXPO_OS === 'web') {
      return inMemoryStorage[key] ?? null;
    }

    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    const webStorage = getWebStorage();

    if (webStorage) {
      webStorage.setItem(key, value);
      inMemoryStorage[key] = value;
      return;
    }

    if (process.env.EXPO_OS === 'web') {
      inMemoryStorage[key] = value;
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    const webStorage = getWebStorage();

    if (webStorage) {
      webStorage.removeItem(key);
      delete inMemoryStorage[key];
      return;
    }

    if (process.env.EXPO_OS === 'web') {
      delete inMemoryStorage[key];
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};

export { isSupabaseConfigured };

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: shouldAutoRefreshToken,
    persistSession: true,
    detectSessionInUrl: process.env.EXPO_OS === 'web',
  },
});
