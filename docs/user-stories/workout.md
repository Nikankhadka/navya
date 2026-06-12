# User Stories: Workout Tracking

## Epic

As a fitness user, I want to view my workout plans, track sessions in real time, and review my workout history so that I can follow a structured training program without needing a separate fitness app.

---

## Stories

### US-WORKOUT-1: View Workout Plan

**As a** user  
**I want** to see my current workout plan with all scheduled days and exercises  
**So that** I know what I need to do each day

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] Workout tab shows current plan name and schedule (e.g., "4-Day Upper/Lower Split")
- [ ] Each day shows day name, exercise count, and estimated duration
- [ ] Tapping a day shows the full exercise list
- [ ] Each exercise shows: name, sets, reps, weight (if applicable), rest time
- [ ] Current day is highlighted or marked
- [ ] Completed days show a checkmark or "Done" badge
- [ ] Empty state if no plan assigned

**Technical Notes:**
- Reads from `workout_plans` and `workout_plan_days` tables
- Plan assigned at onboarding based on goal + frequency + experience

---

### US-WORKOUT-2: Live Workout Session

**As a** user  
**I want** to start a live workout session and track exercises as I complete them  
**So that** I can follow my plan in real time without paper or remembering

**Status:** 🚧 In Progress (core built Sprint 2, set logging Sprint 4)

**Acceptance Criteria:**
- [x] "Start Workout" creates a session with current timestamp
- [x] Session shows exercise list with: name, target sets/reps/weight
- [ ] Each set opens a logging sheet with: weight input (kg/lbs), reps input, RPE slider (1-10)
- [ ] Previous session's weight/reps for same exercise pre-filled as reference
- [ ] Weight quick-adjust buttons (+2.5, -2.5, +5)
- [ ] Rest timer auto-starts when a set is logged (configurable per exercise)
- [x] Progress bar shows overall session completion %
- [ ] User can navigate between exercises (tap to jump, not locked sequential)
- [x] "Finish Workout" ends session, saves completion time
- [ ] Partial sessions can be saved and resumed later same day
- [ ] Session persists if app is backgrounded (state in store + periodic DB flush)
- [ ] User can re-open a logged set to edit reps/weight

**Technical Notes:**
- Session state in `useWorkoutStore` (Zustand) + writes to `workout_sessions` table
- Individual exercise results stored in `workout_session_exercises`
- `workout_sessions` schema: user_id, plan_id, started_at, completed_at, status (in_progress, completed, cancelled)
- Per-set weight/reps/RPE/rest logged in `completed_sets` JSONB column on `session_exercises`

---

### US-WORKOUT-3: Per-Set Exercise Logging

**As a** user  
**I want** to log weight, reps, RPE, and rest for each set  
**So that** I can track progressive overload in detail and see my strength gains

**Status:** 🚧 In Progress (basic complete built Sprint 2, full per-set Sprint 4)

**Acceptance Criteria:**
- [x] Each exercise shows target sets (e.g., "4 × 8-10")
- [ ] Tapping an exercise opens a Set Logging Sheet showing:
  - Set number (e.g., "Set 2 of 4")
  - Weight input field with unit from profile (kg/lbs toggle at top)
  - Weight quick-adjust: +2.5, -2.5, +5 buttons
  - Reps input field
  - RPE slider (1-10, optional) with labels: "Easy" (1-3), "Moderate" (4-6), "Hard" (7-9), "Max" (10)
  - "Log Set" button — saves and auto-starts rest timer
  - Previous session's weight/reps shown as ghost/hint text
- [ ] Completed sets shown below exercise name (e.g., "60kg × 8, 65kg × 8, 65kg × 7")
- [ ] User can tap a completed set row to edit its values
- [ ] Sets are auto-numbered starting at 1
- [ ] RPE is optional (user can skip)
- [ ] Volume computed per exercise: sum(weight × reps) shown after all sets done
- [ ] Rest duration logged per set in session data

**Technical Notes:**
- `session_exercises.completed_sets` JSONB column stores: set_number, reps_completed, weight_kg, rpe, rest_seconds, completed_at
- Last session data queried from most recent completed session for same exercise
- Weight unit from `profiles.weight_unit` (kg/lbs), display conversion on toggle

---

### US-WORKOUT-4: Rest Timer

**As a** user  
**I want** an automatic rest timer between sets  
**So that** I can maintain consistent rest intervals without watching a clock

**Status:** 🚧 In Progress (basic elapsed timer built Sprint 2, full timer Sprint 4)

**Acceptance Criteria:**
- [ ] Timer auto-starts when a set is logged via Set Logging Sheet
- [ ] Default rest duration from plan (30s, 60s, 90s, 120s, 180s)
- [ ] Visual countdown ring with remaining time in center
- [ ] Timer shows current exercise name above ring (e.g., "Rest — Bench Press")
- [ ] Next exercise name shown below (e.g., "Next: Incline DB Press")
- [ ] Controls: Pause, Skip (+0s, starts next set), +30s extend
- [ ] Vibration alert when timer hits 0 (Haptics API)
- [ ] Timer pauses if app goes to background, resumes on foreground (AppState listener)
- [ ] Timer runs globally — survives tab switch (e.g., user goes to Nutrition tab, timer keeps running)
- [ ] Timer notification shown in header if on other tab ("Rest: 0:45 — Bench Press")
- [ ] Rest duration logged per set in session data (`rest_seconds` in CompletedSet)
- [ ] Timer uses `Date.now()` delta for accuracy, not `setInterval` increment

**Technical Notes:**
- In-app haptic vibration via `expo-haptics` (no push notification needed for MVP)
- Timer state managed in `useWorkoutStore` with AppState listener
- Timer read from `Date.now()` on foreground resume to compute actual elapsed time

---

### US-WORKOUT-5: Workout History

**As a** user  
**I want** to view my completed workout sessions with summaries  
**So that** I can track my consistency and review past performance

**Status:** 🚧 In Progress (Sprint 3)

**Acceptance Criteria:**
- [ ] Workout history shows list of completed sessions (date, plan name, duration)
- [ ] Tapping a session shows exercise-by-exercise details (sets, reps, weight)
- [ ] Session summary includes: total exercises, volume lifted, duration, calories (if available)
- [ ] History is filterable by week, month, or all
- [ ] Current week's progress shown (X of Y planned sessions completed)
- [ ] Empty state if no workouts completed yet

**Technical Notes:**
- Query `workout_sessions` where status = 'completed', ordered by date desc
- Volume = sum of (weight × reps × sets) for all exercises in session

---

### US-WORKOUT-9: Log Completed Workout (Post-Hoc)

**As a** user  
**I want** to log a workout I already completed without the app open  
**So that** I can track my training even when I forget to start a live session

**Status:** 📋 Planned (Sprint 4)

**Acceptance Criteria:**
- [ ] "Log Past Workout" button visible on Workout > Today tab (when no active session)
- [ ] User selects a plan day to log against (or "Freeform" — no plan)
- [ ] Date picker allows any past date
- [ ] User enters exercises one by one:
  - Search/type exercise name (autocomplete from exercise library + free text)
  - Add sets: weight, reps, RPE (optional) per set
  - "Add Another Exercise" button at bottom
- [ ] No live timer — straight set logging
- [ ] "Save Workout" creates completed session in DB with selected date
- [ ] Session appears in history immediately
- [ ] Freeform workouts also appear in history (tagged as "Freeform")
- [ ] User can edit a post-hoc logged session within 24 hours

**Technical Notes:**
- Sessions created with `status = 'completed'` directly (no `in_progress` phase)
- `started_at` set to user-selected date + time
- `day_name` = plan day name or "Freeform — [date]"
- `plan_day_id` = null for freeform workouts
- Freeform exercises stored with `exercise_id = null` (name in `exercise_name` only)

---

## Story Dependencies

```
US-WORKOUT-6 (choose split) ──→ US-WORKOUT-7 (custom builder)
        │                               │
        │                        US-WORKOUT-8 (manage plans)
        │
        └──→ US-WORKOUT-1 (view plan) ──→ US-WORKOUT-2 (start session)
                                                    │
                          ┌─────────────────────────┼──────────────────────┐
                          ↓                         ↓                      ↓
                  US-WORKOUT-3 (set log)    US-WORKOUT-4 (rest timer)    US-WORKOUT-9 (post-hoc)
                          │                         │                      │
                          └──────────┬──────────────┘                      │
                                     ↓                                     │
                             US-WORKOUT-5 (history) ←──────────────────────┘
```

**Cross-epic reference:** See also `docs/user-stories/workout-planning.md` for US-WORKOUT-6/7/8 details.

## Edge Cases

- **Skipped exercises:** User can skip an exercise (mark as skipped with reason)
- **Mid-session exit:** Session saves progress, user can resume within same day
- **Mid-session exercise substitution:** User can swap an exercise (e.g., "Can't barbell squat, switch to leg press")
- **Plan completion:** When all days in a plan are completed, suggest "Change plan" or congratulate
- **Weight unit mismatch:** Session respects profile weight unit (kg/lbs), converts display if needed
- **Empty workout day:** If a scheduled day has no exercises, show "Rest day" or allow custom exercise entry
- **Post-hoc date range:** User can log a workout for any past date via calendar picker
- **Rest timer global persistence:** Timer continues across tab switches; shows compact indicator in header
- **Partial set logging:** If user does fewer reps than planned, RPE becomes important signal for auto-regulation
- **Timer accuracy:** Use `Date.now()` delta-based timing instead of `setInterval` increment to prevent drift