# Sprint Planning

## Cadence & Conventions

- **Duration:** 2-week sprints
- **Day 1:** Sprint planning — review MVP backlog, commit to sprint scope
- **Day 5:** Mid-sprint check-in — scope validation, blocker review
- **Day 10:** Sprint review + retro — demo, retrospective, backlog grooming
- **Tracking:** This document + inline story files in `docs/user-stories/`
- **Estimation:** T-shirt sizing (S, M, L, XL) mapped to engineering days
  - S = 1–2 days
  - M = 3–4 days
  - L = 5–8 days
  - XL = 9+ days (needs breaking down)

## MVP Phase Mapping

| Sprint | Phase | Goal | Target Completion |
|--------|-------|------|-------------------|
| Sprint 1 | Foundation | Auth, onboarding, core schema, demo mode | ✅ Complete |
| Sprint 2 | Core Screens | Home dashboard, nutrition manual log, workout plan view, coach shell | ✅ Complete |
| Sprint 3 | Phase 1 — Diary | Meal grouping, quick-add, recent meals, water logging, real streaks | ✅ Complete |
| Sprint 4 | Phase 2 — Progress | Weight check-ins, progress history, workout history, adherence stats | ✅ Complete |
| Sprint 5 | Phase 3 — Coach | Weekly coach summaries, meal templates, barcode capture, plan regeneration | 🚧 Partial |
| Sprint 6 | Polish & Beta | Edge cases, offline resilience, beta deployment, tester seed data | ⬜ Planned |

## Current Sprint: Sprint 5 (MVP Phase 3 — Coach & Capture Speed) 🚧

**Branch:** `0.1-mvp` (Phases 1-4 complete, Phase 5 partial)

Sprints 1-4 are fully complete. Sprint 5 has core items shipped; barcode capture and custom plan builder remaining. Sprint 6 not started.

### Sprint Backlog

| # | Story | Size | Status | Owner |
|---|-------|------|--------|-------|
| 1 | Meal grouping by breakfast, lunch, dinner, snack | M | ✅ Complete | App |
| 2 | Quick-add entry for calories and optional macros | S | ✅ Complete | App |
| 3 | Recent meals / duplicate meal logging | M | ✅ Complete | App |
| 4 | Water logging with daily target | M | ✅ Complete | App+Platform |
| 5 | Real derived streak (replace mock) | S | ✅ Complete | Platform |
| 6 | Daily diary completion state on Home | S | ✅ Complete | App |
| 7 | Water intake schema + RLS | S | ✅ Complete | Platform |
| 8 | Meal template schema + hooks | M | ✅ Complete | Platform |
| 9 | Barcode food capture (feature-flagged, Phase 3 prep) | L | ⬜ Deferred | Both |

### Sprint Risks
- USDA food database offline search reliability (managed via feature flag)
- Barcode data quality — may defer to Sprint 5 if unreliable

---

## Completed Sprints

### Sprint 1: Foundation

**Dates:** Apr 13 – Apr 26, 2026

**Goal:** Auth, onboarding, and core database schema sufficient for demo-mode development.

**Shipped:**
- Supabase Auth (email OTP, Google, Apple)
- 6-screen onboarding flow (welcome, basics, body, goal, preferences, complete)
- `profiles` table with goal, weight, height, workout frequency, onboarding completion
- `mvp_core_schema` migration: workout_plans, workout_sessions, food_logs, coach_messages, feature_flags, push_tokens
- Demo mode with mock data for all tabs
- Tamagui UI theme system (light/dark mode)
- Zustand stores for auth, onboarding, theme, workout

### Sprint 2: Core Screens

**Dates:** Apr 27 – May 10, 2026

**Goal:** All 5 tabs functional with real data where possible, demo data where not.

**Shipped:**
- Home dashboard with greeting, streak chip, weekly activity row
- Today's Session card (workout preview, progress bar, start/continue)
- Nutrition Today card (calories, macros rings, hydration)
- Progress & Adherence card (weight, delta, adherence %)
- AI Coach card (daily insight preview)
- Manual nutrition logging (food name, calories, macros, serving size)
- Workout plan viewing + live session tracking (exercise list, completion, rest timer)
- Coach messaging UI with AI-powered context-aware responses
- Profile editing (goals, body stats, preferences)
- Tester seed data scripts + validation scripts
- Offline nutrition SQLite database (USDA foundation foods)

---

## Backlog (Future Sprints)

### Sprint 4 — Progress & Adherence ✅ COMPLETE

| # | Story | Size | Status |
|---|-------|------|--------|
| 1 | Weight check-in from Profile and Home | S | ✅ |
| 2 | Weight trend chart (WeightTrendCard, bar visualization) | M | ✅ |
| 3 | Workout history with SessionDetailModal + volume calc | M | ✅ |
| 4 | Weekly completion stats on Profile (real data) | S | ✅ |
| 5 | Wire stats to real data (remove placeholders) | M | ✅ |
| 6 | Workout plan selection (4 pre-built splits) | M | ✅ |
| 7 | Per-set logging UI: RPE 1-10 slider, tap-to-edit sets, volume calc | M | ✅ |
| 8 | Rest timer upgrade: vibration, global persistence across tabs | M | ✅ |
| 9 | Post-hoc workout logging (date picker, multi-exercise form) | M | ✅ |

### Sprint 5 — Coach & Capture Speed 🚧 PARTIAL

| # | Story | Size | Status |
|---|-------|------|--------|
| 1 | Weekly coach summary (edge function + Home card) | L | ✅ |
| 2 | Meal templates: 8 AU/NP system presets + save_as_custom | M | ✅ |
| 3 | Barcode-assisted nutrition capture | L | ⬜ Deferred |
| 4 | Choose Workout Split replaces dead-end regenerate button | M | ✅ |
| 5 | Custom plan builder (3-step exercise wizard) | L | ⬜ Planned |

### Sprint 6 — Polish & Beta ⬜ PLANNED

| # | Story | Size | Status |
|---|-------|------|--------|
| 1 | Offline resilience for food logs | M | ⬜ |
| 2 | Edge case handling (empty states, errors) | S | ⬜ |
| 3 | Internal beta deployment (EAS) | S | ⬜ |
| 4 | Tester onboarding docs | S | ⬜ |
| 5 | Unit test coverage (70% services, 50% overall) | L | ⬜ |
| 6 | Performance audit (render times, bundle size) | M | ⬜ |

---

## Definition of Ready

A story is ready for sprint commitment when:
- [ ] User story written with clear acceptance criteria
- [ ] Technical feasibility confirmed (App or Platform lead)
- [ ] Dependencies identified and unblocked
- [ ] Estimated size (S/M/L/XL)
- [ ] UX flow validated or mock attached (Product Research Designer)
- [ ] No dependency on an unstarted story in the same sprint

## Definition of Done

See `docs/ai-team/handoffs/definition-of-done.md` for the full DoD checklist.

Key gates:
- [ ] Code merged with passing CI
- [ ] Acceptance criteria met (manual test)
- [ ] No regression on existing features
- [ ] Documentation updated if applicable
- [ ] Demo-able at sprint review