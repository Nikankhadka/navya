# System Overview

Navya is an Expo application backed by Supabase.

## Main Layers

- App shell: Expo Router
- Presentation: `app/`
- Shared UI and helpers: `src/components`, `src/constants`, `src/utils`
- Client state: Zustand
- Server state: TanStack Query hooks in `src/features/*/hooks`
- Backend access: feature services in `src/features/*/api` plus shared clients in `src/lib`
- Backend platform: Supabase Auth, Postgres, RLS, Edge Functions

## Product Focus

- auth and onboarding
- daily fitness dashboard
- workout plan viewing and tracking
- nutrition diary and fast logging
- progress check-ins for weight and adherence
- limited AI coach and weekly summaries
- profile and settings

## Delivery Philosophy

- upgrade existing tabs and contracts instead of rebuilding the product
- simple architecture that new developers can follow
- explicit contracts over clever abstractions
- typed data boundaries
- documentation kept in the repo
