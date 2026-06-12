# User Stories: Workout Plan Selection & Custom Builder

## Epic

As a fitness user, I want to choose a workout split that matches my goals and experience — or build my own custom plan — so that I can follow a routine I believe in and stay consistent.

---

## Stories

### US-WORKOUT-6: Choose Workout Split

**As a** user  
**I want** to select a workout split from popular pre-built options or build my own  
**So that** my plan matches my current fitness goals and schedule

**Status:** 📋 Planned (Sprint 4)

**Acceptance Criteria:**
- [ ] "Choose Your Split" screen accessible from Profile > Workout Plan section (post-onboarding)
- [ ] Screen shows 6 cards: Bro Split, Push/Pull/Legs, Upper/Lower, Arnold Split, Full Body, Custom
- [ ] Each card displays: name, estimated duration, days/week, difficulty, muscle coverage, icon
- [ ] Tapping a pre-built split shows preview (which muscles on which days, total exercise count)
- [ ] "Select This Split" button generates the plan in DB, sets it as active, navigates to Workout tab
- [ ] Selecting a new split deactivates the current one (soft-delete: `is_active = false`, new `version` incremented)
- [ ] Empty state if no plan selected ("Choose your first workout split")

**Technical Notes:**
- `workout_plans` already has `version` and `is_active` — use these for plan rotation
- Add `plan_type` enum column: `'bro_split' | 'ppl' | 'upper_lower' | 'arnold_split' | 'full_body' | 'custom'`
- Templates stored in `src/features/workout/data/splitTemplates.ts` (static data, exercises mapped from `exercise_library`)
- Plan generation: INSERT into `workout_plans` → INSERT days → INSERT `plan_exercises`

---

### US-WORKOUT-7: Custom Plan Builder

**As a** user  
**I want** to build my own workout plan by selecting exercises, sets, reps, and rest for each day  
**So that** I can follow a routine that perfectly fits my equipment, preferences, and experience

**Status:** 📋 Planned (Sprint 5)

**Acceptance Criteria:**
- [ ] Custom flow is a 3-step wizard:
  - Step 1: Name the plan, select days per week (1-7), assign each day to a day of week
  - Step 2: Per day — search and add exercises from exercise library, set sets/reps/rest per exercise
  - Step 3: Review plan summary → "Create Plan" saves to DB
- [ ] Exercise search shows name, muscle groups, equipment, difficulty
- [ ] User can reorder exercises within a day (drag or up/down buttons)
- [ ] User can set custom rest duration per exercise (30s, 60s, 90s, 120s, 180s)
- [ ] Sets and reps are freeform (e.g., "3 × 8-12" or "4 × 5")
- [ ] Estimated duration recalculates as exercises are added
- [ ] User can go back to edit previous steps
- [ ] "Save as Draft" option — plan saved with `is_active = false`, can activate later
- [ ] Validation: at least 1 exercise per day, no duplicate exercise names per day

**Technical Notes:**
- Reuses same DB tables (`workout_plans`, `workout_plan_days`, `plan_exercises`)
- `plan_type = 'custom'`
- Exercise library fetched from `exercise_library` table (12+ exercises seeded, expandable)
- Draft plans stored with `is_active = false`

---

### US-WORKOUT-8: View & Manage Workout Plans

**As a** user  
**I want** to view my plan history and switch between plans  
**So that** I can try different routines without losing my old ones

**Status:** 📋 Planned (Sprint 5 stretch)

**Acceptance Criteria:**
- [ ] "My Plans" section in Profile shows all plans (active + inactive)
- [ ] Active plan has a green badge
- [ ] Tapping an inactive plan shows a preview with "Activate This Plan" button
- [ ] Activating a plan deactivates the current one
- [ ] Plan cards show: name, type, days/week, date created, version
- [ ] "Delete Plan" option with confirmation (soft delete, or hard delete if no sessions logged against it)
- [ ] Empty state: "No plans yet — choose your first split"

**Technical Notes:**
- Query `workout_plans` where `user_id = current_user` ordered by `created_at` DESC
- Activation: `is_active = true` on selected, `is_active = false` on all others (transaction)

---

## Story Dependencies

```
US-WORKOUT-6 (choose split) ──→ US-WORKOUT-7 (custom builder)
        │
        ├──→ US-WORKOUT-8 (manage plans)
        │
        └──→ US-WORKOUT-1 (view plan, from workout.md)
```

**Cross-epic:**
- US-WORKOUT-6 feeds into US-WORKOUT-1 (plan must exist to be viewed)
- US-WORKOUT-7 produces plans consumable by US-WORKOUT-2 (live session)
- US-WORKOUT-8 requires US-WORKOUT-6 or US-WORKOUT-7 to have created plans

## Edge Cases

- **First-time user:** No plan exists — show onboarding-style prompt to choose split
- **Plan rotation mid-week:** When switching plans, current week's completed sessions remain attributed to old plan; new plan takes effect for remaining days
- **Custom plan without exercise library match:** Allow free-text exercise names that don't exist in `exercise_library` (tagged for library expansion review)
- **Empty exercise library:** If `exercise_library` is empty, custom builder shows warning and prompts seeding
- **Draft plan limits:** Allow max 5 draft plans per user to prevent clutter
