import Constants from 'expo-constants';

export const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? Constants.expoConfig?.extra?.appEnv ?? 'development';

export const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  'https://placeholder.supabase.co';

export const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'placeholder-anon-key';

export const demoModeFlag =
  Constants.expoConfig?.extra?.enableDemoMode ??
  process.env.EXPO_PUBLIC_ENABLE_DEMO_MODE ??
  'false';

export const googleLoginFlag =
  Constants.expoConfig?.extra?.enableGoogleLogin ??
  process.env.EXPO_PUBLIC_ENABLE_GOOGLE_LOGIN ??
  'false';

export const isSupabaseConfigured =
  !supabaseUrl.includes('placeholder') && supabaseAnonKey !== 'placeholder-anon-key';

export const isHostedAppEnv = appEnv === 'preview' || appEnv === 'production';

export const isDemoModeAvailable =
  demoModeFlag === 'true' || (!isHostedAppEnv && !isSupabaseConfigured);

export const isGoogleLoginAvailable = googleLoginFlag === 'true';
