# Beginner Tester Guide

This guide is for someone who wants to run Navya locally and test it like a real user without needing to understand the codebase first.

## What You Need

1. Node.js `20.10.0` or newer
2. `npm` `10` or newer
3. A Supabase project
4. Supabase project credentials:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
5. At least one auth method configured in Supabase
   - Email OTP is the default and easiest path
   - Google OAuth is optional
   - Apple sign-in is optional and only relevant on iOS

## Important Truth About The Current Repo

The repo now supports two useful paths:

- Demo path:
  - If Supabase is not configured, the login screen offers `Explore Demo App`.
  - This enters a mock authenticated session and lets you walkthrough the current MVP with bundled demo data.
  - Use this for UI checks and product walkthroughs.
- Live Supabase path:
  - Real auth, persistence, RLS, and seeded data still require a Supabase project.
  - This is the only path that can honestly validate end-to-end behavior.

## Current Test Data Availability

### Available right now

- Mock workout plan and mock workout history
- Mock nutrition summary, meals, and hydration
- Mock coach messages
- Mock weight-progress history
- SQL seed for:
  - `exercise_library`
  - `workout_plans`
  - `workout_plan_days`
  - `plan_exercises`
  - `food_logs`
  - `water_logs`
  - `weight_logs`
  - completed `workout_sessions`
  - completed `session_exercises`
  - `coach_messages`
  - complete `user_profiles`
- Validation SQL that checks the seeded tester rows

### Still not available right now

- Fully automated end-to-end auth tests
- Service-role automation for tester setup
- Rich weekly summary generation beyond the current coach-message plus feature-flag path

## Step 1: Install And Configure

From the repo root:

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` so it contains real values:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
EXPO_PUBLIC_APP_ENV=development
```

## Step 2: Configure Supabase Auth

In your Supabase dashboard:

1. Enable Email auth.
2. Make sure magic link / OTP sign-in is allowed.
3. Add `navya://auth/callback` as an allowed redirect URL.
4. For local web testing, also add `http://localhost:8081/auth/callback`.
5. If you use a different local web host or port, add that exact `/auth/callback` URL too.

Optional:

- Configure Google if you want to test the Google button.
- Configure Apple if you want to test Apple sign-in on iOS.

## Step 3: Apply The Navya Schema

Run these migrations against your Supabase project:

1. [supabase/migrations/20260410_mvp_core_schema.sql](/Users/nikankhadka/projects/navya/supabase/migrations/20260410_mvp_core_schema.sql:1)
2. [supabase/migrations/20260411_mvp_phase1_water_logs.sql](/Users/nikankhadka/projects/navya/supabase/migrations/20260411_mvp_phase1_water_logs.sql:1)
3. [supabase/migrations/20260508_mvp_phase2_progress_logs.sql](/Users/nikankhadka/projects/navya/supabase/migrations/20260508_mvp_phase2_progress_logs.sql:1)

If you are not using the Supabase CLI, paste the SQL into the Supabase SQL editor and run it there.

## Step 4: Create A Test User

1. Start Navya:

```bash
npm run start
```

2. Open the app in iOS simulator, Android emulator, Expo Go, or web.
3. Use the magic-link email form on the login screen.
4. Open the newest sign-in link on the same device or browser if possible.
5. After login, complete onboarding.

Once the user exists:

1. Go to Supabase Dashboard
2. Open `Authentication`
3. Open `Users`
4. Copy the new user id

## Step 5: Seed The Full Tester Fixture

Generate the tester seed SQL:

```bash
npm run seed:tester -- YOUR_SUPABASE_USER_ID > /tmp/navya-tester-seed.sql
```

Run the contents of `/tmp/navya-tester-seed.sql` in the Supabase SQL editor.

This seed creates:

- a complete profile
- an exercise library and active plan
- seeded food logs and water logs for today
- weight history
- completed workout sessions and session exercises
- seeded coach messages
- weekly-summary flag readiness

## Step 6: Validate The Seeded Data

Generate the validation SQL:

```bash
npm run validate:tester -- YOUR_SUPABASE_USER_ID > /tmp/navya-tester-validation.sql
```

Run the contents of `/tmp/navya-tester-validation.sql` in the Supabase SQL editor and confirm every row reports `pass`.

## Step 7: Verify The Project Boots Cleanly

Run:

```bash
npm run verify
```

Optional web export smoke check:

```bash
npm run smoke:web
```

Important:

- `verify` checks required files and TypeScript.
- `smoke:web` confirms the app can export for web.
- Neither command validates live Supabase auth by itself.

## Step 8: Manual Test Flow

Use this order for the best beginner experience:

1. Open the login screen and confirm branding loads correctly.
2. Send yourself a magic link.
3. Complete sign-in.
4. Finish onboarding.
5. Open Home and confirm:
   - greeting renders
   - today session card shows plan data
   - nutrition section shows meal and hydration totals
   - progress card shows weight and adherence
   - coach section shows a seeded message
6. Open Workout and confirm:
   - today session preview is visible
   - start session works
   - completing sets updates progress
   - finishing the session persists
   - recent history and adherence summary render
7. Open Nutrition and confirm:
   - seeded meals appear
   - adding a meal works
   - deleting a meal works
8. Open Coach and confirm:
   - previous messages appear
   - sending a quick reply stores the user message
   - the coach response is written back into `coach_messages`
9. Open Profile and confirm:
   - profile loads
   - weight check-ins save and history refreshes
   - sign out works

## What You Can Test Without Supabase

If you do not have Supabase credentials yet, you can still do these limited checks:

- `npm run verify`
- `npm run smoke:web`
- app boot
- login screen layout and UI
- demo session walkthrough through `Explore Demo App`

In demo mode you can also test:

- onboarding-free navigation into the main tabs
- mock workout session flows
- mock workout history and adherence surfaces
- mock nutrition logging flows
- mock coach interactions
- mock profile and weight-history UX

You cannot honestly test these without Supabase:

- magic-link login
- onboarding persistence
- route protection after login
- live profile loading
- live weight-check-in persistence
- live workout persistence
- live nutrition persistence
- live coach message persistence

## Known Gaps For Testers

- The app still needs a real Supabase project for true end-to-end validation.
- Social auth depends on provider setup in Supabase.
- Weekly summary is still limited to the current coach-thread plus feature-flag path.
- There is not yet an automated end-to-end test suite for auth and data flows.
