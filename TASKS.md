# TASKS — Navya Sprint Task Board

## Current Sprint: Sprint 3 (MVP Phase 1 — Complete The Daily Diary)

**Dates:** May 11 – May 24, 2026

### 🔴 IN PROGRESS
- [ ] TASK-003 Recent meals / duplicate meal logging — @App
- [ ] TASK-005 Real derived streak (replace mock) — @Platform

### 🟡 READY (unblocked)
- [ ] TASK-006 Daily diary completion state on Home — @App
- [ ] TASK-008 Meal template schema + hooks — @Platform

### ⚪ BLOCKED
- (none currently)

### ✅ DONE THIS SPRINT
- [x] TASK-001 Meal grouping by breakfast, lunch, dinner, snack — @App
- [x] TASK-002 Quick-add entry for calories and optional macros — @App
- [x] TASK-004 Water logging with daily target — @App+Platform
- [x] TASK-007 Water intake schema + RLS — @Platform
- [x] **MVP QA Testing** — Fixed 4 TypeScript errors, installed Playwright, created 67 E2E tests

### 📋 BACKLOG
- [ ] TASK-009 Barcode food capture (feature-flagged, Phase 3 prep) — @Both

---

## Future Sprints

### Sprint 4 — Progress & Adherence
| # | Story | Size | Notes |
|---|-------|------|-------|
| 1 | Weight check-in from Profile and Home | S | Uses `progress_logs` table |
| 2 | Simple progress history (weight trend) | M | Line chart or list view |
| 3 | Workout history from completed sessions | M | List of past sessions with summary |
| 4 | Weekly completion stats on Profile | S | Adherence %, days completed |
| 5 | Wire stats to real data (remove placeholders) | M | Profile no longer uses mock data |
| 6 | Refactor large screen files (>300 lines) | M | Split into sub-components |
| 7 | Add unit test coverage (70% target) | L | Jest + React Testing Library |

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
| 6 | Accessibility audit | M | WCAG 2.1 AA compliance |

---

## Completed Sprints

### Sprint 1: Foundation
**Shipped:** Supabase Auth, 6-screen onboarding, profiles schema, mvp_core_schema migration, demo mode, Tamagui theme, Zustand stores

### Sprint 2: Core Screens
**Shipped:** Home dashboard, manual nutrition logging, workout plan view + live session, coach messaging, profile editing, tester seed scripts, offline nutrition SQLite DB

### Sprint 3: Complete The Daily Diary
**Shipped:** Meal grouping, quick-add calories, water tracking, recent meals, workout history, weight check-in, progress tracking, adherence display
**QA:** Fixed 4 TypeScript errors in AuthCallbackScreen, installed Playwright, created 67 E2E tests covering all user flows
**Status:** ✅ MVP READY FOR DELIVERY