# MVP Scope

## Positioning

Navya should upgrade into a stronger fitness MVP, not rebuild into a different app.

The benchmark is not "all of MyFitnessPal." The benchmark is at least 70% of MyFitnessPal's core daily user loop for a first-time to habitual fitness user:

- profile-driven goals
- daily dashboard
- fast food logging
- calorie and macro tracking
- workout logging
- body progress check-ins
- habit visibility and lightweight guidance

This keeps the MVP realistic while still making Navya materially more complete.

## Research Base

The comparison below uses current official MyFitnessPal sources:

- MyFitnessPal Premium feature list: home dashboard, barcode scanner, meal scan, voice logging, workout routines, macros by meal, calorie goals by meal, intermittent fasting, and multi-day logging
  - https://support.myfitnesspal.com/hc/en-us/articles/360032625951-What-are-the-features-of-MyFitnessPal-Premium
- MyFitnessPal measurement tracking help: weight and additional measurements such as body fat and steps appear in the Progress experience
  - https://support.myfitnesspal.com/hc/en-us/articles/360032624891-Can-I-track-additional-measurements-or-change-the-default-measurements%29to
- MyFitnessPal barcode scan help: barcode-based food lookup and correction is a core supported food logging path
  - https://support.myfitnesspal.com/hc/en-us/articles/360032272132-How-do-I-edit-or-change-the-item-found-by-a-barcode-scan

## Current Navya Base

Navya already has a usable starting point:

- auth and onboarding
- home tab with workout, nutrition, streak, and coach summary cards
- workout plan viewing and live workout session tracking
- manual meal logging with calories and macros
- profile editing for goal, weight, height, and workout frequency
- limited coach messaging
- typed Supabase contracts for profiles, workout plans, sessions, food logs, coach messages, feature flags, and push tokens

This means the right move is to layer missing habit-loop features on top of the existing tabs and schema.

## MyFitnessPal Comparison

### Core Parity Target

Navya MVP should target 10 of 14 core MyFitnessPal-style capability buckets, which is roughly 71% coverage of the daily fitness loop.

| Capability Bucket | MyFitnessPal Baseline | Navya Today | MVP Upgrade Decision |
| --- | --- | --- | --- |
| Goal-based onboarding | Strong | Present | Keep and tighten |
| Daily dashboard | Strong | Partial | Upgrade |
| Calorie tracking | Strong | Present | Keep |
| Macro tracking | Strong | Present | Keep and improve |
| Meal-based diary | Strong | Present | Keep and improve |
| Quick add / recent logging | Strong | Missing | Add |
| Barcode-assisted capture | Strong | Missing | Add lightweight version |
| Water tracking | Strong | Missing | Add |
| Weight and body progress | Strong | Partial | Add proper check-in flow |
| Exercise diary | Strong | Partial | Upgrade current workout history |
| Workout routines / plans | Present | Present | Keep |
| Streaks / adherence loops | Present | Partial/mock | Make real |
| Insight / weekly guidance | Present | Partial | Upgrade current coach summaries |
| Device integrations / broad ecosystem sync | Strong | Missing | Defer from MVP |

## MVP In Scope

### Keep And Harden

- auth
- onboarding
- home dashboard
- workout plan viewing
- workout session tracking
- manual nutrition logging
- limited AI coach
- profile and settings
- internal beta deployment

### Add As Upgrade Tracks

- real daily dashboard fed by workout, nutrition, weight, water, and streak data
- nutrition diary grouped by meal with faster add flows
- quick-add calories and macros for repeat logging
- recent meals and reusable meal templates
- barcode-assisted food capture behind a feature flag
- water intake logging and daily target display
- weight check-in flow with lightweight progress history
- workout history and simple exercise diary summaries
- real streaks and adherence scoring
- weekly coach summary generated from logged workout and nutrition behavior

## Explicitly Out Of Scope

- beauty modules and non-fitness positioning
- open-ended unlimited AI chat
- trainer marketplace
- payments
- medical advice
- broad wearable integrations
- full social community, friends, or feed mechanics
- recipe marketplace or advanced recipe parser
- premium-only parity items such as meal scan, voice logging, intermittent fasting, and multi-day diary editing

## 70% MVP Feature Set

The target release should cover these 10 capability buckets:

1. goal-based onboarding and profile setup
2. daily dashboard with workout, calories, macros, streak, and coach summary
3. calorie tracking
4. macro tracking
5. meal-based diary
6. quick-add and recent/reusable meals
7. water tracking
8. weight and progress check-ins
9. workout plan plus workout diary/history
10. streaks plus weekly coaching summary

Optional stretch item:

- barcode-assisted food capture if the food data path is reliable enough for beta

## MVP Upgrade Phases

### Phase 1: Complete The Daily Diary

Goal: make Nutrition and Home feel like a real daily habit product.

Scope:

- add meal grouping by breakfast, lunch, dinner, snack
- add quick-add entry for calories and optional macros
- add recent meals / duplicate meal logging
- add water logging with daily target
- replace mock streak display with a real derived streak
- show actual daily diary completion state on Home

Acceptance criteria:

- a tester can log a full day of food in under 60 seconds using manual plus quick-add paths
- Home reflects calories, macros, water, and streak state from real data
- all diary widgets work in both demo mode and live Supabase mode

### Phase 2: Add Progress And Adherence ✅ COMPLETE (0.1-mvp)

Goal: turn profile data into visible progress.

Scope:

- add weight check-ins from Profile and Home ✅
- add weight trend chart (WeightTrendCard) ✅
- add workout history with SessionDetailModal + volume calc ✅
- add split selection with 4 pre-built templates ✅
- per-set logging: RPE 1-10 slider, tap-to-edit sets ✅
- rest timer: vibration, global persistence ✅
- post-hoc workout logging ✅
- surface weekly completion stats in Profile from real data ✅

### Phase 3: Coach And Capture Speed 🚧 PARTIAL (0.1-mvp)

Goal: make Navya feel smarter without rebuilding the product.

Scope:

- generate weekly coach summary from real data (edge function) ✅
- add meal templates: 8 system presets + save_as_custom flow ✅
- replace dead-end regenerate button with Choose Workout Split ✅
- add feature-flagged barcode-assisted nutrition capture ⬜ Deferred
- custom plan builder ⬜ Planned

## Product Rules

- every new feature must extend an existing tab before creating a new one
- nutrition upgrades belong in `Nutrition`, `Home`, and `Profile`, not a separate food product area
- progress upgrades belong in `Profile` and `Home`, not a new analytics surface
- any barcode or food-search capability must be feature-flagged
- any AI-generated guidance must stay bounded to summaries, nudges, and plan adjustments

## Recommended Build Order

1. finish live Supabase validation for the existing schema and hooks
2. ship Phase 1 diary upgrades
3. ship Phase 2 progress and adherence upgrades
4. ship Phase 3 coach and capture-speed upgrades
5. run internal beta with the 10-bucket coverage target as the release gate
