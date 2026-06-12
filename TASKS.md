# TASKS — Navya Sprint Task Board

## Active Branch: `0.1-mvp` (not yet merged to `main`)

---

## Sprint 3 — Complete The Daily Diary ✅ COMPLETE

**Dates:** May 11 – May 24, 2026

### ✅ DONE
- [x] TASK-001 Meal grouping by breakfast, lunch, dinner, snack
- [x] TASK-002 Quick-add entry for calories and optional macros
- [x] TASK-003 Recent meals / duplicate meal logging
- [x] TASK-004 Water logging with daily target
- [x] TASK-005 Real derived streak (replace mock)
- [x] TASK-006 Daily diary completion state on Home (DiaryCompletionCard)
- [x] TASK-007 Water intake schema + RLS
- [x] TASK-008 Meal template schema + hooks (meal_templates table, 8 system presets)
- [x] MVP QA Testing — Fixed 4 TypeScript errors, installed Playwright, 67 E2E tests

---

## Sprint 4 — Progress & Adherence ✅ COMPLETE

| # | Story | Size | Status |
|---|-------|------|--------|
| 1 | Weight check-in from Profile and Home | S | ✅ |
| 2 | Weight trend chart (WeightTrendCard on Profile) | M | ✅ |
| 3 | Workout history with session detail modal | M | ✅ |
| 4 | Weekly completion stats on Profile (real data) | S | ✅ |
| 5 | Per-set logging: RPE 1-10 slider, tap-to-edit sets, volume calc | M | ✅ |
| 6 | Rest timer: vibration alert, global tab-switch persistence | M | ✅ |
| 7 | Workout split selection (4 templates) + plan generation | M | ✅ |
| 8 | Post-hoc workout logging (date picker, multi-exercise form) | M | ✅ |

---

## Sprint 5 — Coach & Capture Speed ✅ PARTIALLY COMPLETE

| # | Story | Size | Status |
|---|-------|------|--------|
| 1 | Weekly coach summary (WeeklyCoachSummaryCard + edge function) | L | ✅ |
| 2 | Meal templates with 8 AU/NP system presets | M | ✅ |
| 3 | Meal template creation UI for users (save_as_custom flow) | M | ✅ |
| 4 | "Choose Workout Split" replaces dead-end regenerate button | M | ✅ |
| 5 | Barcode-assisted nutrition capture | L | ⬜ Deferred |
| 6 | Custom plan builder (US-WORKOUT-7) | L | ⬜ Planned |

---

## Sprint 6 — Polish & Beta ⬜ REMAINING

| # | Story | Size | Status |
|---|-------|------|--------|
| 1 | Offline resilience for food logs | M | ⬜ |
| 2 | Edge case handling (empty states, errors) | S | ⬜ |
| 3 | Internal beta deployment (EAS) | S | ⬜ |
| 4 | Tester onboarding docs | S | ⬜ |
| 5 | Unit test coverage (70% services, 50% overall) | L | ⬜ |
| 6 | Performance audit (render times, bundle size) | M | ⬜ |
| 7 | Accessibility audit | M | ⬜ |
| 8 | E2E test coverage for new Phase 2-4 features | L | ⬜ |

---

## Completed Sprints

### Sprint 1: Foundation
**Shipped:** Supabase Auth, 6-screen onboarding, profiles schema, mvp_core_schema migration, demo mode, Tamagui theme, Zustand stores

### Sprint 2: Core Screens
**Shipped:** Home dashboard, manual nutrition logging, workout plan view + live session, coach messaging, profile editing, tester seed scripts, offline nutrition SQLite DB

### Sprint 3: Complete The Daily Diary
**Shipped:** Meal grouping, quick-add calories, water tracking, recent meals, workout history, weight check-in, progress tracking, adherence display, daily diary completion card, meal templates schema + 8 system presets

---

## Database Migrations (on `0.1-mvp`)

| Migration | Purpose |
|-----------|---------|
| `20260410_mvp_core_schema.sql` | Core: user_profiles, exercise_library, workout_plans/days/exercises, sessions/session_exercises, food_logs, coach_messages, feature_flags |
| `20260411_mvp_phase1_water_logs.sql` | Water logs table + RLS |
| `20260412_onboarding_fields.sql` | Onboarding columns on user_profiles |
| `20260508_mvp_phase2_progress_logs.sql` | Weight logs table + RLS |
| `20260509_nutrition_offline_search.sql` | custom_foods, favorite_foods, extended food_logs |
| `20260522_fix_security_lints.sql` | Security hardening |
| `20260612_meal_templates.sql` | meal_templates + 8 system presets + water_target_ml/goal_weight |
| `20260612_add_performance_indexes_and_timestamps.sql` | Indexes + updated_at on log tables |
| `20260613_exercise_library_seed.sql` | 31 exercises for all 4 split templates |

## Edge Functions (on `0.1-mvp`)

| Function | Purpose |
|----------|---------|
| `coach-action` | Stub — reply to coach messages (wire to OpenAI) |
| `coach-weekly-summary` | Weekly aggregation (workouts, food, weight) → summary text |
