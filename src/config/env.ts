import Constants from 'expo-constants';

const rawSupabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

const rawSupabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabaseUrl =
  rawSupabaseUrl ||
  (() => {
    throw new Error(
      'EXPO_PUBLIC_SUPABASE_URL is not set. Copy .env.example to .env and configure your Supabase URL.',
    );
  })();

export const supabaseAnonKey =
  rawSupabaseAnonKey ||
  (() => {
    throw new Error(
      'EXPO_PUBLIC_SUPABASE_ANON_KEY is not set. Copy .env.example to .env and configure your Supabase anon key.',
    );
  })();

export const isSupabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

const coachFeatureFlag =
  Constants.expoConfig?.extra?.coachFeatureFlag ?? process.env.EXPO_PUBLIC_ENABLE_COACH ?? 'true';

export const isCoachEnabled = coachFeatureFlag === 'true';

export const siteUrl = process.env.EXPO_PUBLIC_SITE_URL ?? 'http://localhost:8081';
