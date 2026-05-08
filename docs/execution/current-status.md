# Current Status

## Current Phase

- Week 2: live Supabase reliability and hosted web auth hardening

## Current Step

- Auth and deployment plumbing now target the real hosted-web path: browser auth sessions persist on web, `/auth/callback` owns session completion instead of the gate, demo fallback is disabled for preview/production app envs, and Vercel clean-URL hosting is documented as the first web deployment target. Live Supabase proof still remains blocked in this workspace because no real `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, Google provider config, or tester UUID is loaded here.

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
- switched web Supabase auth persistence from in-memory fallback to browser `localStorage`
- moved auth callback completion into the dedicated callback screen and kept `/auth/callback` public inside routing
- hardened auth store initialization so Supabase auth subscription registration is idempotent
- disabled automatic demo fallback for `preview` and `production` app environments
- added the first Vercel deployment config and documented preview/production env requirements
- passed `npm run verify`
- passed `npm run smoke:web`

## In Progress

- hosted Supabase validation for `W5-001`
- applying the existing migrations to a real Supabase project
- configuring Supabase Email + Google auth for stable preview and production callback URLs
- verifying hosted web auth and seeded-data reads on Vercel preview

## Next Recommended Step

- create the new Supabase project and load real preview/production env values into Vercel and local `.env.local`
- enable Email auth plus Google auth in Supabase and allow-list the local, preview, and production callback URLs
- apply all three Navya migrations in the hosted Supabase project
- create a real tester account through the web magic-link flow and capture the Auth UUID
- render and run `npm run seed:tester -- <tester-uuid>` and `npm run validate:tester -- <tester-uuid>` in the Supabase SQL editor
- verify live reads and writes for login, onboarding routing, profile edits, weight check-ins, hydration, workout completion, Home adherence, and coach thread loading on Vercel preview

## Blockers

- `W5-001` still cannot be closed from this workspace until real Supabase project values are available at runtime
- live validation also requires Google provider setup plus a real tester account created through Navya auth so the seed and validation SQL can target a real Supabase Auth UUID
- weekly summary is still constrained to the current coach-message and feature-flag path; a richer summary contract should stay out of scope until live proof is complete

## Last Updated

- 2026-05-08
