# Route Specs

This document maps every current MVP route to its design purpose, must-show modules, and key states.

## `/(auth)/login`

- Purpose: let a new or returning athlete enter through real auth or demo with zero confusion.
- Must show: value prop, email input, magic-link CTA, demo entry, social auth utility, Supabase warning when unavailable.
- States:
  - default: cinematic welcome plus one obvious primary action
  - disabled: real auth disabled when Supabase is missing
  - success: magic-link sent confirmation
  - demo: entry path remains first-class and visible

## `/auth/callback`

- Purpose: reassure the user during sign-in completion.
- Must show: loading state, clear status copy, intentional transition card.
- States:
  - loading: secure sign-in in progress
  - failure: handled by root auth guard and existing callback error logic

## `/(onboarding)/welcome`

- Purpose: commit the user to setup with one obvious next step.
- Must show: brand intro, short setup expectation, one primary CTA.
- States:
  - default: motivational welcome
  - deterministic demo onboarding path still supported by existing routing

## `/(onboarding)/basics`

- Purpose: capture identity, age, gender, country, and current training focus.
- Must show: display name, age range, gender, country, focus selector, continue gating.
- Notes:
  - legacy `glow_focus` values stay data-compatible
  - visible UI language should describe fitness focus, not beauty/glow positioning

## `/(onboarding)/body`

- Purpose: collect weight, height, and training experience.
- Must show: two numeric metric fields, one experience selector group, continue CTA.
- States:
  - disabled continue until required fields are present

## `/(onboarding)/goal`

- Purpose: choose one primary fitness outcome.
- Must show: single-select goal cards, description copy, continue CTA.
- States:
  - unmistakable selected state
  - one-goal-only guidance

## `/(onboarding)/preferences`

- Purpose: finish weekly plan-shaping preferences without overload.
- Must show: workouts-per-week stepper, activity level, diet preference, equipment, finish CTA.
- States:
  - multi-select equipment
  - single-select activity and diet

## `/(onboarding)/complete`

- Purpose: save onboarding and route the user into the app.
- Must show: saving, success, and retry/restart states.
- States:
  - loading: save in progress
  - success: transition to tabs
  - error: start-over path

## `/(tabs)` Shared Shell

- Purpose: keep movement across the five core surfaces obvious without complex navigation.
- Must show: floating bottom dock, active state, emoji identity, safe-area spacing.
- States:
  - current tab always visually distinct
  - web uses the same mobile shell model

## `/(tabs)/index`

- Purpose: summarize the day and present the next action quickly.
- Must show: greeting, streak, weekly rhythm row, today’s workout, nutrition summary, hydration, progress check-in, coach preview, weight-check-in modal.
- States:
  - default: live or demo data summary
  - empty: explanatory copy when workout data is missing
  - modal: weight check-in entry
- Reserved space:
  - stronger adherence summary
  - workout-history preview

## `/(tabs)/workout`

- Purpose: preview today’s session, complete it, inspect the weekly plan, and hold future history.
- Must show: `Today` and `Full Plan`, no-session empty state, active progress, completion state, weekly plan, plan-day detail sheet.
- States:
  - not started
  - active session
  - completed session
  - no plan / no session
  - plan detail modal
- Reserved space:
  - completed-session history block inside this tab

## `/(tabs)/nutrition`

- Purpose: make food and water logging fast enough for daily use.
- Must show: daily macro summary, hydration, quick-add calories, recent meals, grouped diary, add-meal sheet, visible delete action.
- States:
  - default diary
  - empty meal section
  - add-meal modal
  - delete confirmation
- Reserved space:
  - feature-flagged barcode slot inside this tab

## `/(tabs)/coach`

- Purpose: provide bounded guidance with clear AI status.
- Must show: AI status, context strip, conversation history, typing state, quick replies, input composer.
- States:
  - active AI
  - offline / disabled AI
  - typing
- Reserved space:
  - weekly coach summary module in-tab

## `/(tabs)/profile`

- Purpose: review setup, show progress, edit profile, and exit safely.
- Must show: profile hero, badges, stats, body metrics, progress check-ins, setup list, action list, edit modal, weight-check-in modal, sign-out or exit demo.
- States:
  - default
  - edit profile modal
  - weight check-in modal
  - visible non-MVP actions must explain themselves
- Reserved space:
  - real adherence metrics
  - nutrition and workout aggregates
  - workout-history summary

## Overlay States

These stay in current routes and do not become new navigation:

- Home weight check-in modal
- Profile edit-profile modal
- Profile weight check-in modal
- Workout plan-day detail modal
- Nutrition add-meal modal
- Nutrition delete confirmation

## External Prompt Starters

Use these as starting points for external visualization tools:

- Login: “Premium forest-themed mobile fitness login, calm cinematic layout, matte bark surfaces, leaf-green accents, amber CTA, no generic gradients.”
- Onboarding: “Sequential mobile fitness onboarding, forest-path metaphor, segmented progress trail, asymmetrical but clear layout, tactile selectors.”
- Home: “Living daily dashboard for a premium fitness app, one dominant hero module, hydration and progress companion cards, natural dark palette.”
- Workout: “Operational workout screen with segmented progress, plan mode plus today mode, premium forest-tech material language.”
- Nutrition: “Fast mobile nutrition diary, macro hero, hydration reservoir, grouped meal sections, visible delete affordance.”
- Coach: “Calm supportive coaching screen, bounded AI guidance, context strip, tasteful quick-reply chips, premium dark natural theme.”
- Profile: “Field-journal style profile screen with meaningful stat modules, progress check-ins, and polished edit overlays.”
