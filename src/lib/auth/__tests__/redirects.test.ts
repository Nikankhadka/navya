// @ts-nocheck
import { getAuthCallbackError, createSessionFromUrl } from '../redirects';

const mockMakeRedirectUri = jest.fn();
const mockSetSession = jest.fn();
const mockExchangeCodeForSession = jest.fn();
const mockParseLinking = jest.fn();

jest.mock('expo-linking', () => ({
  parse: (...args: unknown[]) => mockParseLinking(...args),
  useURL: jest.fn(),
  createURL: jest.fn(),
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: (...args: unknown[]) => mockMakeRedirectUri(...args),
}));

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      setSession: (...args: unknown[]) => mockSetSession(...args),
      exchangeCodeForSession: (...args: unknown[]) => mockExchangeCodeForSession(...args),
    },
  },
}));

jest.mock('@/config/env', () => ({
  siteUrl: 'https://navya.app',
}));

describe('getAuthCallbackError', () => {
  it('returns null when no error code is present', () => {
    mockParseLinking.mockReturnValue({ queryParams: {} });
    const result = getAuthCallbackError('navya://callback#access_token=abc');
    expect(result).toBeNull();
  });

  it('returns user-friendly message for otp_expired', () => {
    mockParseLinking.mockReturnValue({ queryParams: { error_code: 'otp_expired' } });
    const result = getAuthCallbackError('navya://callback?error_code=otp_expired');
    expect(result).toContain('That sign-in link is invalid or has expired');
  });

  it('returns decoded error description for other errors', () => {
    mockParseLinking.mockReturnValue({
      queryParams: {
        error_code: 'some_error',
        error_description: 'Something+went+wrong',
      },
    });
    const result = getAuthCallbackError(
      'navya://callback?error_code=some_error&error_description=Something+went+wrong',
    );
    expect(result).toBe('Something went wrong');
  });

  it('returns fallback message when error_code present but no description', () => {
    mockParseLinking.mockReturnValue({
      queryParams: { error_code: 'unknown_error' },
    });
    const result = getAuthCallbackError('navya://callback?error_code=unknown_error');
    expect(result).toBe('Authentication could not be completed. Please try again.');
  });
});

describe('createSessionFromUrl', () => {
  beforeEach(() => {
    mockSetSession.mockReset();
    mockExchangeCodeForSession.mockReset();
    mockParseLinking.mockReset();
  });

  it('returns error for empty URL', async () => {
    const result = await createSessionFromUrl('');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toContain('No sign-in URL was provided');
    }
  });

  it('returns error when URL contains error_code', async () => {
    mockParseLinking.mockReturnValue({
      queryParams: { error_code: 'otp_expired' },
    });
    const result = await createSessionFromUrl('navya://callback?error_code=otp_expired');
    expect(result.success).toBe(false);
  });

  it('exchanges code for session when URL contains code but no tokens', async () => {
    mockParseLinking.mockReturnValue({ queryParams: { code: 'test-auth-code' } });
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    const result = await createSessionFromUrl('navya://callback?code=test-auth-code');
    expect(result.success).toBe(true);
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('test-auth-code');
  });

  it('returns error when code exchange fails', async () => {
    mockParseLinking.mockReturnValue({ queryParams: { code: 'bad-code' } });
    mockExchangeCodeForSession.mockResolvedValue({
      error: { message: 'Invalid flow state' },
    });
    const result = await createSessionFromUrl('navya://callback?code=bad-code');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toContain('Navya could not verify');
    }
  });

  it('sets session with access_token and refresh_token from fragment', async () => {
    mockParseLinking.mockReturnValue({ queryParams: {} });
    mockSetSession.mockResolvedValue({ error: null });
    const result = await createSessionFromUrl(
      'https://app.example/callback#access_token=abc123&refresh_token=def456',
    );
    expect(result.success).toBe(true);
    expect(mockSetSession).toHaveBeenCalledWith({
      access_token: 'abc123',
      refresh_token: 'def456',
    });
  });

  it('returns error when setSession fails', async () => {
    mockParseLinking.mockReturnValue({ queryParams: {} });
    mockSetSession.mockResolvedValue({ error: { message: 'Token expired' } });
    const result = await createSessionFromUrl(
      'navya://callback#access_token=abc&refresh_token=def',
    );
    expect(result.success).toBe(false);
  });

  it('returns error when URL has no tokens and no code', async () => {
    mockParseLinking.mockReturnValue({ queryParams: { utm_source: 'email' } });
    const result = await createSessionFromUrl('navya://callback?utm_source=email');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toContain('did not include a valid auth code');
    }
  });

  it('handles access_token in query params', async () => {
    mockParseLinking.mockReturnValue({
      queryParams: { access_token: 'query123', refresh_token: 'query456' },
    });
    mockSetSession.mockResolvedValue({ error: null });
    const result = await createSessionFromUrl(
      'navya://callback?access_token=query123&refresh_token=query456',
    );
    expect(result.success).toBe(true);
    expect(mockSetSession).toHaveBeenCalledWith({
      access_token: 'query123',
      refresh_token: 'query456',
    });
  });

  it('reads access_token from hash fragment when also present in query', async () => {
    mockParseLinking.mockReturnValue({ queryParams: { access_token: 'query123' } });
    mockSetSession.mockResolvedValue({ error: null });
    const result = await createSessionFromUrl(
      'navya://callback?access_token=query123#access_token=hash123&refresh_token=hash456',
    );
    expect(result.success).toBe(true);
    expect(mockSetSession).toHaveBeenCalledWith({
      access_token: 'hash123',
      refresh_token: 'hash456',
    });
  });
});
