# Current Status

## Current Phase

- Week 5: coach summaries and beta hardening

## Current Step

- The weekly coach summary slice is implemented locally: Coach now renders a real in-tab weekly check-in derived from workouts, nutrition, hydration, streak, and weight signals, Home can preview that recap, and demo mode uses richer seeded week data for repeat testing.
- The app-wide Mist & Moss editorial refresh is in progress locally through shared tokens, ambient surface layering, and responsive typography without changing screen structure or the centered mobile web shell.

## Completed In This Session

- standardized package scripts and app identity
- added Navya repo plugin and role skills
- added BMAD customization for routing and review prompts
- created canonical docs for architecture, onboarding, standards, MVP, sprint tracking, ADR, and execution status
- installed Navya skills into the global Codex skill directory
- switched the main tabs to hook and service boundaries instead of direct raw mock imports
- moved auth toward OTP-first deep-link handling
- removed the extra `pnpm` lockfile
- added a canonical MVP schema migration for profiles, plans, sessions, nutrition, coach, flags, and push tokens
- added mutation hooks and service write paths for workout sessions, nutrition logging, and coach requests
- replaced loose Supabase casts with typed service mappers for plans, sessions, meals, coach messages, and feature flags
- fixed local workout session creation so child exercise rows keep the same generated parent session id
- persisted coach quick-reply responses back into `coach_messages` after the Edge Function returns
- added a beginner tester guide for local setup, auth prerequisites, and manual user-flow verification
- added a repeatable tester seed flow for workout, nutrition, and coach starter data tied to a real tester account
- added a UI stack decision doc and ADR recommending Tamagui as the long-term shared component foundation
- added a local demo session path so testers can enter the app and exercise mock workout, nutrition, coach, and profile flows without Supabase credentials
- turned the Profile tab `Edit Profile` action into a working modal flow that saves core profile fields in both demo and real sessions
- turned Workout plan-day cards into a working detail flow with exercise, rest, equipment, focus area, and coach-note visibility
- passed `npm run verify`
- passed `npm run smoke:web`
- hardened auth callback handling for web and native with clearer expired-link errors and documented localhost redirect requirements
- added a concrete `/auth/callback` route so local web magic-link redirects no longer hit Expo Router's unmatched route page
- researched current MyFitnessPal fitness-tracking primitives from official sources and reframed the Navya MVP around 70% parity with the core daily habit loop
- upgraded the MVP and sprint plan to extend existing Home, Nutrition, Workout, Profile, and Coach surfaces instead of proposing a rebuild
- added typed hydration and reusable-meal contracts plus a Phase 1 `water_logs` Supabase migration
- upgraded the Nutrition tab into a grouped daily diary with hydration logging, recent meal re-log, and quick-add calories
- replaced the Home tab's mock streak with a real streak derived from logged meals, hydration, and completed workouts
- added typed `weight_logs` contracts, a Supabase migration, and demo-backed service methods for lightweight progress tracking
- added weight check-in flows to both Home and Profile with recent history cards and demo-session persistence
- added completed-session workout history summaries to the Workout tab with demo-backed persistence and live Supabase reads
- replaced Profile placeholder stats with derived adherence metrics for workouts, active days, streak, and latest weight
- extended deterministic smoke coverage for workout-history and adherence-stat demo states
- added a dedicated weekly coach summary read model with hook and service boundaries instead of screen-level aggregation
- turned the Coach tab placeholder summary area into a real weekly recap card with metrics, next-step guidance, and demo-aware fallback states
- upgraded Home to preview the weekly coach summary when it is available instead of relying on stale oldest-first message ordering
- improved demo-week consistency by seeding richer weekly food, hydration, and streak signals for recap testing
- passed `npm run verify`
- passed `npm run smoke:web`
- refreshed the shared design tokens to the Mist & Moss editorial palette with cooler ambient shadows and a surface hierarchy
- added responsive typography helpers and applied them to shared UI, auth, onboarding, home, profile, and tab chrome
- updated the design-system and frontend standards docs to match the live token-first React Native implementation

## In Progress

- validating typed relational reads and write paths against a real Supabase project
- finalizing schema and RLS to match the hardened typed contracts
- replacing remaining demo fallbacks with live seeded records once the hosted schema exists
- connecting the new hydration and weight-check-in persistence paths to a live Supabase project
- validating the new workout-history, adherence-summary, and weekly-summary reads against a real Supabase project

## Next Recommended Step

- connect a real Supabase project and regenerate final `src/types/supabase.ts`
- validate the new read and write paths against the live schema and fix any relation mismatches, including `water_logs` and `weight_logs`
- verify the new workout history summaries, adherence metrics, and weekly coach summary against live seeded records
- run a focused visual review of the Mist & Moss refresh on device widths and tighten any remaining hardcoded borders or type outliers in the remaining tabs
- build the next MVP speed layer with meal templates and reusable logging
- decide whether barcode-assisted food capture should be in beta behind a feature flag or deferred until food data quality is proven
- verify OTP email and social auth end to end on device builds

## Blockers

- real Supabase project values are still required for end-to-end auth and production data verification
- barcode-assisted logging should not be committed to beta scope unless a reliable food data source is approved

## Last Updated

- 2026-04-17
