# Navya Codemaps Index

**Last Updated:** 2026-06-13

This directory contains architectural maps of the Navya codebase, auto-generated from the source.

| Codemap | Description |
|---------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | High-level system overview, component relationships, data flow |
| [FEATURES.md](FEATURES.md) | Feature modules (auth, coach, home, nutrition, profile, workout) |
| [ROUTES.md](ROUTES.md) | Expo Router file-based routes and navigation |
| [SERVICES.md](SERVICES.md) | Backend services, Supabase client, Edge Functions, database schema |

## Quick Reference

### Project Stack
| Layer | Tech |
|---|---|
| Frontend | Expo SDK 55, React Native 0.83, TypeScript strict |
| Navigation | Expo Router (file-based) |
| Styling | Custom theme system (dark/light) |
| State | Zustand (client), TanStack Query (server) |
| Backend | Supabase (auth, Postgres, RLS, Edge Functions) |
| Testing | Jest + React Native Testing Library, Playwright (E2E) |
| Deploy | EAS (iOS/Android), Vercel (web) |

### Source Structure
```
src/
  app/            Expo Router file-based routes
  features/       Feature-first modules (auth, coach, home, nutrition, onboarding, profile, workout)
  components/     Shared UI components (ui/, layout/, shared/)
  store/          Zustand stores (auth, date, onboarding, theme, workout)
  providers/      App context wrappers (QueryClient, Theme, Auth gate)
  lib/            Shared libraries (supabase client, auth, logger, validation)
  config/         App configuration (env vars, query client)
  types/          Shared TypeScript types
  theme/          Theme tokens, definitions, provider
  utils/          Utility functions (date, formatting, helpers)
```
