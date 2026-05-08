# User Flow Test Plan

This document turns the current Navya MVP into explicit user stories and step-by-step QA flows so testers can validate real behavior, not just inspect screens.

## How To Use This Plan

1. Run `npm run visual:smoke` for a fast web screenshot pass.
2. Run `npm run verify` to confirm the repo and types still pass.
3. Use the step-by-step flows below for manual checks, especially where the MVP still relies on Supabase or modal interactions.

## Flow 1: Login And Entry

User story:
As a new or returning athlete, I want a clear entry point so I can either sign in with Supabase or safely explore the product in demo mode.

Steps:
1. Open `/(auth)/login` or `/login` on web.
2. Confirm the Navya title, supporting copy, email input, and `Send Magic Link` button are visible.
3. If Supabase is not configured, confirm the warning banner explains that real auth is unavailable.
4. If demo mode is available, tap `Explore Demo App`.
5. Confirm the app enters the main tabs instead of leaving the user on the login screen.

Expected result:
- The login screen clearly explains the difference between real auth and demo access.
- Demo entry is obvious and works in one tap.

Failure signals:
- Buttons appear but do nothing.
- Supabase is missing and the screen gives no recovery path.
- Demo mode does not enter the app.

## Flow 2: Onboarding

User story:
As a first-time athlete, I want onboarding to feel sequential and low-friction so I can finish profile setup without confusion.

Steps:
1. Start from `/welcome?navya-test-session=demo-onboarding` for a deterministic web check, or use a real incomplete user.
2. Tap `Get Started`.
3. Complete Basics.
4. Complete Body.
5. Choose one goal on the Goal step.
6. Set workouts per week and supporting preferences.
7. Continue to the completion screen.
8. Confirm the app transitions into the main tabs when onboarding completes.

Expected result:
- Each screen has one primary action and one clear next step.
- The completion screen leads into the product instead of ending in a dead state.

Failure signals:
- Missing navigation between steps.
- Inputs do not persist between screens.
- Completion saves but the user is not redirected into the app.

## Flow 3: Home Dashboard

User story:
As an active user, I want the home screen to summarize my day so I can decide what to do next in a few seconds.

Steps:
1. Enter demo mode or a seeded real account.
2. Open `/` on web with `?navya-test-session=demo-tabs`.
3. Confirm the greeting, today session summary, nutrition summary, and coach preview render together.
4. Tap `View Plan`, `Log Food`, and the coach card one by one.

Expected result:
- The home screen gives three clear next actions: workout, nutrition, and coach.
- Each CTA moves the user to the relevant tab.

Failure signals:
- Summary cards render empty without explanation.
- CTA labels imply one action but route somewhere else.

## Flow 4: Workout Session

User story:
As a user with a training plan, I want to preview today’s workout, start it, and finish it without losing progress.

Steps:
1. Open `/workout?navya-test-session=demo-tabs`.
2. Confirm the Today tab shows the active session preview.
3. Tap `Start Session`.
4. Mark sets complete for the active exercise.
5. Skip one exercise to confirm the skip state is visible.
6. Finish the workout.
7. Switch to `Full Plan`.
8. Open a plan day and review the detail sheet.

Expected result:
- Session progress changes as sets are completed.
- The workout can be finished without silent failure.
- The correct current weekday is highlighted in the plan instead of always highlighting Monday.

Failure signals:
- The wrong day is marked as today.
- Progress never changes.
- A plan-day tap does not open details.

## Flow 5: Nutrition Logging

User story:
As a user tracking meals, I want to add and remove meals with visible controls so I can trust what counts toward today’s totals.

Steps:
1. Open `/nutrition?navya-test-session=demo-tabs`.
2. Confirm calories and macro summaries render.
3. Tap `+ Log Meal`.
4. Add a meal name, calories, and optional macros.
5. Save the meal.
6. Confirm the meal appears in the list and totals update.
7. Tap the visible `Delete` action on a meal.
8. Confirm the deletion prompt appears before removal.

Expected result:
- Adding a meal updates the list immediately.
- Deleting a meal is discoverable and confirmable.

Failure signals:
- Deletion only works through a hidden long-press gesture.
- Totals do not update after add or delete.

## Flow 6: Coach

User story:
As a user seeking guidance, I want to read prior coach messages and send a quick reply without wondering whether the message went through.

Steps:
1. Open `/coach?navya-test-session=demo-tabs`.
2. Confirm prior messages render with clear role separation.
3. Tap one quick reply chip.
4. Confirm the user message appears immediately.
5. Confirm the typing state appears and a coach response follows.

Expected result:
- The conversation feels responsive.
- AI status is visible so users know whether the coach is active.

Failure signals:
- Sending input gives no UI response.
- The coach status badge and disabled state disagree.

## Flow 7: Profile And Settings

User story:
As a user managing my account, I want profile editing and settings actions to be understandable so I never hit a dead-end tap.

Steps:
1. Open `/profile?navya-test-session=demo-tabs`.
2. Confirm profile hero, stats, body metrics, setup rows, and action list render.
3. Tap `Edit Profile`.
4. Update the name or goal and save.
5. Tap `Notification Settings`.
6. Tap `Regenerate Workout Plan`.
7. Sign out or exit demo.

Expected result:
- Edit Profile opens a real modal and can save.
- Non-MVP actions explain that they are intentionally unavailable instead of doing nothing.
- Sign out returns the user to login.

Failure signals:
- Buttons are visible but silent.
- Save closes the modal without changing any visible state.

## Automated Coverage

`npm run visual:smoke` captures the current web UI for these deterministic states:

- login
- onboarding welcome
- onboarding goal
- home
- workout
- workout plan modal
- nutrition
- coach
- profile

This smoke run is intentionally screenshot-first and text-assertion-based. It is not a replacement for real Supabase E2E testing, but it is fast enough to catch visual regressions and broken routing before a human tester starts deeper validation.

Portal-driven modal checks such as nutrition add-meal and profile edit still belong in the manual checklist above, because React Native Web does not expose those sheets consistently enough for the current headless DOM assertions.
