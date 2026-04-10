# Auth And Security

## Auth Contract

- Supabase Auth only
- OTP email is the default login path
- Google and Apple social sign-in are allowed
- phone OTP is deferred unless explicitly brought into scope

## Security Contract

- never call AI providers directly from the client
- never store secrets in Expo public config
- keep service-role access server-side only
- use `expo-secure-store` for session persistence on native
