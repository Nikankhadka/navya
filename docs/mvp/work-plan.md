# MVP Work Plan

## Current Priority

Live Supabase auth/profile testing is the current release-risk focus. Demo mode and
static web export pass, but the MVP is not stable until a real magic-link tester can
load and mutate seeded data through Supabase RLS.

## MVP Scope

- In scope: auth, onboarding, profile, Home dashboard, workout plans and sessions,
  nutrition diary, hydration, weight progress, streaks, limited coach messages,
  weekly summary, and internal beta readiness.
- Deferred: barcode-assisted food capture, payments, marketplace/social features,
  wearable sync, and open-ended unlimited AI chat.

## Weekly Delivery Track

| Week | Focus | Gate |
| --- | --- | --- |
| Week 1 | Foundation and live test setup | Seed and validation SQL render; setup docs exist; automated gates pass |
| Week 2 | Live Supabase reliability | Magic-link tester loads seeded profile, nutrition, hydration, workout, coach, progress, and summary data |
| Week 3 | Daily diary parity | Nutrition and Home work in demo and live mode for meals, macros, water, recent meals, and streaks |
| Week 4 | Progress and adherence | Workout history and Profile aggregates use real completed sessions, streak, nutrition, and weight data |
| Week 5 | Coach and beta hardening | Weekly coach summary and beta checklist pass with no Critical or High defects |

## Immediate Next Step

Create a real tester through the app magic-link flow, copy the Supabase Auth UUID,
run the tester seed SQL in the Supabase SQL editor, run the validation SQL, then
verify the app as that same signed-in tester.

## Current Week 1 Tasks

- Extend the tester seed to cover complete profile, workouts, food, water, weight,
  completed sessions, coach messages, and feature flags.
- Add a validation SQL template for seeded row counts and profile completeness.
- Document SQL-editor setup as the first live fixture path.
- Record known issues and decisions in `../execution/weekly-issue-log.md` and
  `../execution/decision-log.md`.
