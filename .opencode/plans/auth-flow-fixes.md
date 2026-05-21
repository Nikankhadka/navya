# Auth Flow Fixes — Implementation Plan

## Issue 1: AuthCallbackScreen Stuck on Loading

### Root Cause
Race condition between `Linking.useURL()` and `handleCallback()`:
1. `handleCallback()` runs once on mount via `useEffect(() => { handleCallback() }, [])`
2. But `incomingUrl` from `Linking.useURL()` may be `null` on first render — arrives later
3. The first useEffect's cleanup resets `setLoading(true)` when URL changes, but `handleCallback()` never re-runs
4. Result: spinner forever, nothing happens

### Fix
- Single `useEffect` that triggers `handleCallback` when `incomingUrl` changes (not just on mount)
- `useCallback` for `handleCallback` with proper dependencies
- 10-second timeout fallback if no URL arrives
- Proper cleanup on unmount
- Toast-based alert (see Fix 3)
- Countdown timer display for auto-redirect
- Removed dead code paths (duplicate session checks, nested retries)

---

## Issue 2: SignupScreen — Inconsistent Redirect URL

### Root Cause
Line 89 uses: `${process.env.EXPO_PUBLIC_APP_URL ?? "navya://"}auth/callback`
This is missing a `/` before `auth/callback` when `EXPO_PUBLIC_APP_URL` is set, and doesn't match `getAuthRedirectUrl()` logic.

### Fix
- Import `getAuthRedirectUrl` from `@/lib/auth/redirects`
- Replace hardcoded URL with `getAuthRedirectUrl()`

---

## Issue 3: Alert Component — Use Tamagui Toast

### Root Cause
The current Alert was using Tamagui's `AlertDialog` which is modal-based. User wants toast notifications instead.

### Fix
- Rewrote `Alert` component to use Tamagui's `Toast` system via `useToastController`
- Added `ToastProvider` to `AppProviders.tsx`
- Added `ToastViewport` to `_layout.tsx`
- Alert component now shows toasts with:
  - `preset: "ok"` for default variant
  - `preset: "error"` for destructive variant
  - Optional action button
  - Auto-dismiss after configurable duration (default 4s)
- Created `useToastAlert` hook for imperative toast usage

---

## Issue 4: LoginScreen — Resend Verification Email

### Root Cause
When user gets "Email not confirmed" error, they have no way to resend the verification email from the login screen.

### Fix
- Added `action` property to alert state type
- When "Email not confirmed" error occurs, show "Resend Verification" action button
- Action calls `supabase.auth.resend({ type: "signup", email })`
- Shows success/error toast after resend attempt

---

## Issue 5: Minimum Loading Display Time

### Root Cause
Alerts can flash instantly if async operations complete too fast, making the UX feel jarring.

### Fix
- Created `withMinimumLoading()` utility in `src/lib/auth/loading.ts`
- Ensures minimum 500ms loading display
- Applied to:
  - `LoginScreen.tsx`: `handleMagicLinkAuth`, `handlePasswordAuth`
  - `SignupScreen.tsx`: `handleSignup`
  - `ForgotPasswordScreen.tsx`: `handleResetRequest`

---

## Files Modified

| File | Change |
|------|--------|
| `src/features/auth/screens/AuthCallbackScreen.tsx` | Full rewrite — fix race condition, add timeout, use Toast alert |
| `src/features/auth/screens/SignupScreen.tsx` | Use `getAuthRedirectUrl()`, add minimum loading |
| `src/components/ui/Alert.tsx` | Rewritten to use Tamagui Toast instead of AlertDialog |
| `src/features/auth/screens/LoginScreen.tsx` | Add resend verification action, minimum loading, update alert type |
| `src/features/auth/screens/ForgotPasswordScreen.tsx` | Add minimum loading, use `getAuthRedirectUrl()` |
| `src/features/auth/screens/ResetPasswordScreen.tsx` | Update Alert onOpenChange behavior |
| `src/lib/auth/loading.ts` | New utility — `withMinimumLoading()` |
| `src/providers/AppProviders.tsx` | Add `ToastProvider` |
| `src/app/_layout.tsx` | Add `ToastViewport` |
| `src/hooks/useToastAlert.ts` | New hook for imperative toast usage |
