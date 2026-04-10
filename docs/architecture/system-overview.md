# System Overview

Navya is an Expo application backed by Supabase.

## Main Layers

- App shell: Expo Router
- Presentation: `app/`
- Shared UI and helpers: `src/components`, `src/constants`, `src/utils`
- Client state: Zustand
- Server state: TanStack Query hooks in `src/hooks`
- Backend access: services in `src/services`
- Backend platform: Supabase Auth, Postgres, RLS, Edge Functions

## Product Focus

- auth
- onboarding
- workout plan viewing and tracking
- nutrition logging
- limited AI coach
- profile and settings

## Delivery Philosophy

- simple architecture that new developers can follow
- explicit contracts over clever abstractions
- typed data boundaries
- documentation kept in the repo
