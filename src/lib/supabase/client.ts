import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { demoModeFlag, isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from '@/config/env';
import type { Database } from '@/types/database';

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

export const isDemoModeAvailable = demoModeFlag === 'true' || !isSupabaseConfigured;
export { isSupabaseConfigured };

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
