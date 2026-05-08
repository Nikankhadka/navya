# Current Status

## Current Phase

- Week 4: progress and adherence upgrade

## Current Step

- Progress and adherence are now implemented locally: `weight_logs` exists as a first-class contract, Profile supports logged weight check-ins and recent history, Home shows a compact progress/adherence card, Workout shows recent completed-session history, and the tester seed plus validation SQL now cover those flows. Live Supabase proof for `W5-001` remains blocked because this workspace does not currently have runtime `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, or a real magic-link tester UUID loaded.

## Completed In This Session

- verified that no live Supabase env values are loaded in the current workspace shell, so the latest release-risk issue cannot be closed from this environment alone
- reconciled repo truth by confirming the core schema never added `weight_logs` even though QA expected it
- added the Phase 2 `weight_logs` Supabase migration with RLS coverage
- aligned `src/types/database.ts` with the new `weight_logs` contract
- added typed weight-log mapping plus a progress service for weight history and check-ins
- added Profile weight check-ins, recent weight history, and replaced placeholder profile stats with real derived adherence/session data
- added a Home progress and adherence card backed by live/demo weight and workout summary reads
- added Workout recent-session history and adherence summary backed by completed `workout_sessions`
- updated the workout today-session read path to prefer active in-progress sessions and fall back to the current plan preview
- expanded the tester seed to cover profile completeness, water, weight history, completed workouts, session exercises, and weekly-summary feature-flag readiness
- added a tester validation SQL template and renderer script for repeatable hosted-Supabase checks
- refreshed the tester seed README to document both seed and validation flows
- passed `npm run verify`
- passed `npm run smoke:web`

## In Progress

- hosted Supabase validation for `W5-001`
- applying the new progress migration and regenerated contracts to a real Supabase project
- confirming how weekly-summary behavior should evolve beyond the current coach-message plus feature-flag path

## Next Recommended Step

- load real `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` values into the runtime environment
- create a real tester account through the magic-link flow and capture the Auth UUID
- apply `supabase/migrations/20260508_mvp_phase2_progress_logs.sql` in the hosted Supabase project
- render and run `npm run seed:tester -- <tester-uuid>` and `npm run validate:tester -- <tester-uuid>` in the Supabase SQL editor
- verify live reads and writes for profile edits, weight check-ins, hydration, workout completion, Home adherence, and coach thread loading

## Blockers

- `W5-001` cannot be closed from this workspace until `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are available at runtime
- live validation also requires a real tester account created through Navya auth so the seed and validation SQL can target a real Supabase Auth UUID
- weekly summary is still constrained to the current coach-message and feature-flag path; a richer summary contract should stay out of scope until live proof is complete

## Last Updated

- 2026-05-08
