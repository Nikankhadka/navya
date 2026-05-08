import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { isDemoModeAvailable, isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from '@/config/env';
import type { Database } from '@/types/database';

const inMemoryStorage: Record<string, string> = {};

function getWebStorage(): Storage | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
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

    if (Platform.OS === 'web') {
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

    if (Platform.OS === 'web') {
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

    if (Platform.OS === 'web') {
      delete inMemoryStorage[key];
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};

export { isDemoModeAvailable, isSupabaseConfigured };

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
