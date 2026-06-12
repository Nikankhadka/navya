import Constants from 'expo-constants';

export const appEnv =
  process.env.EXPO_PUBLIC_APP_ENV ?? Constants.expoConfig?.extra?.appEnv ?? 'development';

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

export const demoModeFlag =
  Constants.expoConfig?.extra?.enableDemoMode ??
  process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE ??
  'false';

export const isSupabaseConfigured = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

export const isHostedAppEnv = appEnv === 'preview' || appEnv === 'production';

export const isDemoModeAvailable =
  demoModeFlag === 'true' || (!isHostedAppEnv && !isSupabaseConfigured);

export const coachFeatureFlag =
  Constants.expoConfig?.extra?.coachFeatureFlag ?? process.env.EXPO_PUBLIC_ENABLE_COACH ?? 'true';

export const isCoachEnabled = coachFeatureFlag === 'true';

export const isLocalDev = supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1');
