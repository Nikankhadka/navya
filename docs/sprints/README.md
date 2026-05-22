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
| Sprint 3 | Phase 1 — Diary | Meal grouping, quick-add, recent meals, water logging, real streaks | 🚧 In Progress |
| Sprint 4 | Phase 2 — Progress | Weight check-ins, progress history, workout history, adherence stats | 📋 Planned |
| Sprint 5 | Phase 3 — Coach | Weekly coach summaries, meal templates, barcode capture, plan regeneration | 📋 Planned |
| Sprint 6 | Polish & Beta | Edge cases, offline resilience, beta deployment, tester seed data | 📋 Planned |

## Current Sprint: Sprint 3 (MVP Phase 1 — Complete The Daily Diary)

**Dates:** May 11 – May 24, 2026

### Sprint Goal
Make Nutrition and Home feel like a real daily habit product. A tester can log a full day of food in under 60 seconds and see their complete daily state on Home.

### Team Capacity
- Senior Engineer App (Expo/RN)
- Senior Engineer Platform (Supabase)
- Product Owner + Research Designer (validation & flow)

### Sprint Backlog

| # | Story | Size | Status | Owner |
|---|-------|------|--------|-------|
| 1 | Meal grouping by breakfast, lunch, dinner, snack | M | ✅ Complete | App |
| 2 | Quick-add entry for calories and optional macros | S | ✅ Complete | App |
| 3 | Recent meals / duplicate meal logging | M | 🚧 In Progress | App |
| 4 | Water logging with daily target | M | ✅ Complete | App+Platform |
| 5 | Real derived streak (replace mock) | S | 🚧 In Progress | Platform |
| 6 | Daily diary completion state on Home | S | 📋 Ready | App |
| 7 | Water intake schema + RLS | S | ✅ Complete | Platform |
| 8 | Meal template schema + hooks | M | 📋 Ready | Platform |
| 9 | Barcode food capture (feature-flagged, Phase 3 prep) | L | 📋 Backlog | Both |

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

### Sprint 4 — Progress & Adherence

| # | Story | Size | Notes |
|---|-------|------|-------|
| 1 | Weight check-in from Profile and Home | S | Uses `progress_logs` table |
| 2 | Simple progress history (weight trend) | M | Line chart or list view |
| 3 | Workout history from completed sessions | M | List of past sessions with summary |
| 4 | Weekly completion stats on Profile | S | Adherence %, days completed |
| 5 | Wire stats to real data (remove placeholders) | M | Profile no longer uses mock data |

### Sprint 5 — Coach & Capture Speed

| # | Story | Size | Notes |
|---|-------|------|-------|
| 1 | Weekly coach summary from real data | L | Edge function + Home card |
| 2 | Meal templates for common meals | M | Breakfast/lunch/dinner/snack presets |
| 3 | Barcode-assisted nutrition capture | L | Feature-flagged, camera + USDA lookup |
| 4 | "Regenerate Workout Plan" real flow | M | Replace dead-end action with bounded AI call |

### Sprint 6 — Polish & Beta

| # | Story | Size | Notes |
|---|-------|------|-------|
| 1 | Offline resilience for food logs | M | Queue failed writes, sync on reconnect |
| 2 | Edge case handling (empty states, errors) | S | Consistent across all screens |
| 3 | Internal beta deployment (EAS) | S | TestFlight + internal distribution |
| 4 | Tester onboarding docs | S | README for beta testers |
| 5 | Performance audit (render times, bundle size) | M | Tamagui optimization, code splitting |

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