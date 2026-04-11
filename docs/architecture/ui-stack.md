# UI Stack

## Current State

Navya currently uses:

- Expo + React Native
- a small custom component layer in `src/components/ui`
- shared design tokens in `src/constants/theme.ts`
- `nativewind` as an available styling utility, not as the primary component system

This means the app is functional today, but the UI layer is still mostly hand-rolled and will become harder to scale as more screens and states are added.

## Decision

Adopt `Tamagui` as the primary UI library for Navya going forward.

## Why Tamagui

- built for React Native and Expo first
- works across native and web without forcing a web-only abstraction
- provides stable primitives, tokens, theming, stacks, sheets, forms, and overlays
- supports gradual adoption, so we can migrate screen by screen instead of rewriting the app
- better fit for Navya than `shadcn/ui` or Radix, which are web-first and would create mismatch in a mobile-first Expo app

## Why Not Shadcn Or Radix

- `shadcn/ui` is primarily a web composition pattern on top of Radix + Tailwind
- Radix primitives are excellent for web accessibility, but they are not the right foundation for native Expo screens
- using them as the main system here would increase bridge code, divergence, and maintenance cost

## Migration Rule

Do not build new shared UI primitives from scratch unless Tamagui clearly does not cover the need.

Use the current custom components only as a temporary compatibility layer while migration is in progress.

## Recommended Migration Plan

### Phase 1

- add Tamagui dependencies and config
- map the current design tokens from `src/constants/theme.ts` into Tamagui tokens
- prove the setup on one non-critical shared primitive

### Phase 2

- replace the current shared primitives first:
  - `Button`
  - `Input`
  - `Card`
  - `Badge`
  - `SectionHeader`
  - `EmptyState`
- keep existing screen APIs stable where practical so migration does not ripple through every route at once

### Phase 3

- migrate high-traffic screens in this order:
  - auth
  - onboarding
  - home
  - workout
  - nutrition
  - coach

### Phase 4

- remove obsolete custom primitives
- keep only Navya-specific composed components where product behavior is custom
- document the final UI conventions for future contributors

## Guardrails

- prefer library primitives over new local base components
- keep tokens centralized
- avoid mixed foundations inside a single screen when possible
- preserve mobile-first layout and performance
- do not bring in web-only UI abstractions as the primary screen layer

## Immediate Practical Guidance

Until Tamagui is installed and adopted:

- keep using the existing `src/components/ui` components
- avoid expanding that layer more than necessary
- route any new shared primitive decisions through this doc and the related ADR
