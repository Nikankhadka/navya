# Weekly Issue Log

## Week 1: Supabase Auth/Profile Test Setup

| ID | Severity | Status | Issue | Fix Notes | Retest Result |
| --- | --- | --- | --- | --- | --- |
| W1-001 | High | Fixed locally | Existing tester seed did not cover full MVP live testing for profile completeness, hydration, weight history, completed sessions, weekly summary inputs, and validation. | Expanded the tester seed into a fuller MVP fixture and added a validation SQL renderer/template. | Seed and validation render locally; hosted SQL-editor execution still required. |
| W1-002 | High | Fixed locally | Existing seed template referenced `target_user` outside its CTE scope in later SQL statements. | Reworked multi-statement sections so each statement has its own `target_user` CTE or literal tester UUID. | Rendered SQL contains no unresolved `__TEST_USER_ID__` placeholders. |
| W1-003 | Medium | Documented | Supabase CLI is not installed locally, so SQL-editor setup is the first live integration path. | Documented SQL-editor seed and validation flow in `supabase/seeds/README.md`. | Accepted for first live tester pass. |
| W1-004 | Medium | Blocked by environment | `npm run visual:smoke` cannot bind/probe local visual smoke ports in the current sandbox without approval or an external `NAVYA_VISUAL_BASE_URL`. | Visual smoke remains a QA gate for an environment where local server binding is allowed. | `npm run verify` and `npm run smoke:web` pass; visual smoke not completed here. |

## Week 5: Coach And Beta Hardening

| ID | Severity | Status | Issue | Fix Notes | Retest Result |
| --- | --- | --- | --- | --- | --- |
| W5-001 | High | Blocked by environment | Weekly summary, workout history, adherence metrics, water, and weight reads still need proof against live seeded Supabase records. | Local prep is now complete: `weight_logs` migration added, Profile/Home/Workout progress surfaces implemented, tester seed expanded for water, weight, and completed workouts, and validation SQL added. Live closure still needs runtime `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and a real magic-link tester UUID. | `npm run verify` and `npm run smoke:web` pass locally; hosted Supabase validation is still pending. |
