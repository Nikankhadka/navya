# Decision Log

## 2026-04-24: Live Supabase Tester Fixture

- Decision: use a real app-created magic-link tester account, then seed that exact
  Supabase Auth UUID through the SQL editor.
- Reason: this validates auth callback, session creation, profile loading, RLS, and
  app data reads together without introducing service-role automation.
- Consequence: SQL-editor validation proves fixture rows exist; app sign-in is still
  required to prove RLS and user-facing behavior.

## 2026-04-24: Full MVP Seed Coverage

- Decision: tester seed covers profile completeness, feature flags, workout plan,
  completed workout session, food logs, water logs, weight logs, and coach messages.
- Reason: sparse live data would make Home, Nutrition, Workout, Coach, and Profile
  look broken even when schema and services are correct.
- Consequence: seed SQL must remain idempotent for the same tester account.

## 2026-04-24: Barcode Deferred From MVP Fixture

- Decision: barcode-assisted food capture is not seeded as an active capability.
- Reason: the MVP can complete the daily fitness loop with manual, quick-add,
  recent meal, and reusable meal paths while food-source quality remains unresolved.
- Consequence: `food_search_enabled` remains `false` in the tester fixture.

## 2026-04-25: SQL Editor Before Service-Role Automation

- Decision: first live test setup uses rendered SQL and the Supabase SQL editor.
- Reason: it is faster, avoids committing service-role assumptions, and is enough
  to validate current auth/profile and seeded-data behavior.
- Consequence: automation can be added later only if repeated tester setup becomes
  a real bottleneck.
