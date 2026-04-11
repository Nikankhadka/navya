# Beginner Tester Guide

This guide is for someone who wants to run Navya locally and test it like a real user, without needing to understand the codebase first.

## What You Need

You need these before Navya can be tested end to end:

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

The repo contains mock data in [src/mocks/mockData.ts](/home/nikan/projects/navya/src/mocks/mockData.ts:1), but that does not currently give a true beginner a full app walkthrough by itself.

Why:

- Auth still depends on a real Supabase session.
- The app redirects unauthenticated users to the login flow.
- The only SQL seed currently included in the schema migration is a default `feature_flags` row.
- There is no live seed yet for `exercise_library`, workout plans, meals, or coach history.

What this means in practice:

- Without Supabase credentials, you can only inspect the login screen and basic app boot behavior.
- With Supabase credentials but no seeded app data, you can test auth and onboarding, but most post-login tabs will show empty states.
- With Supabase credentials and a minimal seed dataset, you can test the app much more completely as a user.

There is now also a local demo path:

- If Supabase is not configured, the login screen offers `Explore Demo App`.
- This enters a mock authenticated session and lets you walkthrough the current MVP using bundled demo data.
- This is useful for UI checks and product walkthroughs, but it is not a replacement for real backend testing.

## Current Test Data Availability

### Available right now

- Mock workout plan and mock workout session
- Mock nutrition summary and meal data
- Mock coach messages
- Default `feature_flags` row inserted by the migration

### Not available right now

- No SQL seed for `exercise_library`
- No SQL seed for `workout_plans`
- No SQL seed for `workout_plan_days`
- No SQL seed for `plan_exercises`
- No SQL seed for `food_logs`
- No SQL seed for `coach_messages`

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

Optional:

- Configure Google if you want to test the Google button.
- Configure Apple if you want to test Apple sign-in on iOS.

If Google or Apple are not configured in Supabase, those buttons may render but will fail when used.

## Step 3: Apply The Navya Schema

Run the SQL in [supabase/migrations/20260410_mvp_core_schema.sql](/home/nikan/projects/navya/supabase/migrations/20260410_mvp_core_schema.sql:1) against your Supabase project.

If you are using the Supabase CLI in your own environment, you can apply the migration there. If not, you can paste the SQL into the Supabase SQL editor and run it.

After that, the database should contain:

- auth-triggered `user_profiles`
- workout tables
- nutrition tables
- coach tables
- default `feature_flags`

## Step 4: Create A Test User

1. Start Navya:

```bash
npm run start
```

2. Open the app in one of these ways:
   - iOS simulator
   - Android emulator
   - Expo Go on a physical device
   - Web for quick UI checks

3. Use the magic-link email form on the login screen.
4. Open the sign-in link on the same device if possible.
5. After login, complete onboarding.

Once the user exists, copy that user id from Supabase:

1. Go to Supabase Dashboard
2. Open `Authentication`
3. Open `Users`
4. Copy the new user id

You will use that id in the seed script below.

## Step 5: Seed Minimal Test Data

Generate the tester seed SQL with:

```bash
npm run seed:tester -- YOUR_SUPABASE_USER_ID > /tmp/navya-tester-seed.sql
```

Then copy the contents of `/tmp/navya-tester-seed.sql` into the Supabase SQL editor and run it.

This seed creates:

- a small exercise library
- one active workout plan
- one plan day with exercises
- a few food logs for today
- a coach message thread starter

## Step 6: Verify The Project Boots Cleanly

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
- Neither command validates live Supabase auth or live Supabase data.

## Step 7: Manual Test Flow

Use this order for the best beginner experience:

1. Open the login screen and confirm branding loads correctly.
2. Send yourself a magic link.
3. Complete sign-in.
4. Finish onboarding.
5. Open Home and confirm:
   - greeting renders
   - today session card shows seeded plan data
   - nutrition section shows seeded meal totals
   - coach section shows a starter message
6. Open Workout and confirm:
   - today session is visible
   - start session works
   - completing sets updates progress
   - finishing the session persists
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
- mock nutrition logging flows
- mock coach interactions
- profile and sign-out UX

You cannot honestly test these without Supabase:

- magic-link login
- onboarding persistence
- route protection after login
- profile loading
- live workout persistence
- nutrition persistence
- coach message persistence

## Known Gaps For Testers

- The app still needs a real Supabase project for true end-to-end validation.
- Social auth depends on provider setup in Supabase.
- There is not yet a canonical automated seed for complete tester data.
- There is not yet an automated end-to-end test suite for auth and data flows.

## Fastest Recommended Path

If your goal is to test Navya as a user today, the fastest reliable path is:

1. Create a Supabase project
2. Set `.env.local`
3. Apply the schema migration
4. Sign in once through the app
5. Copy the created user id
6. Run the generated tester seed SQL
7. Relaunch the app and test all main tabs
