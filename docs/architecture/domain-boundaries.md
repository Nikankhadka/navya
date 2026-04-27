# Domain Boundaries

## Presentation

- `app/` owns route structure and presentation
- screens should not fetch from Supabase directly

## Hooks

- `src/features/*/hooks/` owns TanStack Query usage and app-facing data composition

## Services

- `src/features/*/api/` owns feature-specific Supabase calls and backend-side shaping
- `src/lib/` owns shared platform clients, auth redirects, and Supabase mappers

## Stores

- `src/store/` owns transient local state only
- stores must not become the persistent source of truth

## Types

- `src/types/` owns shared app and backend contracts

## Docs

- `docs/` owns architecture, onboarding, MVP, standards, and execution context
