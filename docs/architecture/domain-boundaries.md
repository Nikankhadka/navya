# Domain Boundaries

## Presentation

- `app/` owns route structure and presentation
- screens should not fetch from Supabase directly

## Hooks

- `src/hooks/` owns TanStack Query usage and app-facing data composition

## Services

- `src/services/` owns Supabase calls and backend-side shaping

## Stores

- `src/stores/` owns transient local state only
- stores must not become the persistent source of truth

## Types

- `src/types/` owns shared app and backend contracts

## Docs

- `docs/` owns architecture, onboarding, MVP, standards, and execution context
