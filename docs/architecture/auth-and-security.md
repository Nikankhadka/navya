# Auth And Security

## Auth Contract

- Supabase Auth only
- email/password auth is supported for MVP fallback when OTP delivery is unreliable
- OTP email remains available as an alternate login path
- Google auth is supported for web and native preview flows
- Apple sign-in remains allowed on iOS, but is not part of the first hosted web release gate
- phone OTP is deferred unless explicitly brought into scope
- `/auth/callback` is a first-class public route and must stay reachable without pre-auth redirects
- web auth must persist across browser refresh and new-tab returns from Supabase

## Security Contract

- never call AI providers directly from the client
- never store secrets in Expo public config
- keep service-role access server-side only
- passwords must flow only through Supabase Auth; the client must never hash and persist its own password records
- Supabase Auth is responsible for password hashing and credential storage server-side
- use `expo-secure-store` for session persistence on native
- use browser `localStorage` for session persistence on web
- do not let preview or production web silently fall back to demo mode when Supabase is misconfigured
