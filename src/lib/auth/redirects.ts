import * as Linking from 'expo-linking';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase/client';
import { siteUrl } from '@/config/env';

export function getAuthRedirectUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const baseUrl = siteUrl ?? window.location.origin;
    return `${baseUrl}/callback`;
  }

  return makeRedirectUri({
    scheme: 'navya',
    native: 'navya://callback',
    path: 'callback',
  });
}

type AuthCallbackParams = {
  accessToken?: string;
  refreshToken?: string;
  code?: string;
  errorCode?: string;
  errorDescription?: string;
};

export type CreateSessionFromUrlResult =
  | { success: true }
  | {
      success: false;
      message: string;
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
      (typeof parsed.queryParams?.error_code === 'string'
        ? parsed.queryParams.error_code
        : undefined) ??
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

function getCodeExchangeErrorMessage(message: string): string {
  if (/code verifier|flow state|invalid flow/i.test(message)) {
    return 'Navya could not verify that sign-in on this browser. Request a new link and open the newest email in the same browser that asked for it.';
  }

  if (/already|used/i.test(message)) {
    return 'That sign-in link has already been used. If you are not signed in yet, request a fresh magic link.';
  }

  return message;
}

export async function createSessionFromUrl(url: string): Promise<CreateSessionFromUrlResult> {
  if (!url) {
    return {
      success: false,
      message: 'No sign-in URL was provided.',
    };
  }

  const { accessToken, refreshToken, code, errorCode } = extractSessionParams(url);

  if (errorCode) {
    return {
      success: false,
      message:
        getAuthCallbackError(url) ?? 'Authentication could not be completed. Please try again.',
    };
  }

  if (!accessToken || !refreshToken) {
    if (!code) {
      return {
        success: false,
        message:
          'The sign-in link did not include a valid auth code. Confirm your exact callback URL is allow-listed in Supabase and try the newest email link.',
      };
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Code exchange failed:', error.message);
      return {
        success: false,
        message: getCodeExchangeErrorMessage(error.message),
      };
    }

    return { success: true };
  }

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    console.error('Session creation failed:', error.message);
    return {
      success: false,
      message: error.message,
    };
  }

  return { success: true };
}
