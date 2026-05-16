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

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] "Start Workout" creates a session with current timestamp
- [ ] Session shows current exercise with: name, target sets/reps/weight
- [ ] Each set can be marked complete with: weight used, reps completed, RPE (optional)
- [ ] Rest timer between sets (configurable, default 60–90s)
- [ ] Progress bar shows overall session completion %
- [ ] User can navigate between exercises (next / previous)
- [ ] "Finish Workout" ends session, saves completion time
- [ ] Partial sessions can be saved (user can continue later)
- [ ] Session persists if app is backgrounded or crashes (state in store + DB)

**Technical Notes:**
- Session state in `useWorkoutStore` (Zustand) + writes to `workout_sessions` table
- Individual exercise results stored in `workout_session_exercises`
- `workout_sessions` schema: user_id, plan_id, started_at, completed_at, status (in_progress, completed, cancelled)

---

### US-WORKOUT-3: Exercise Tracking (Sets, Reps, Weight)

**As a** user  
**I want** to log weight, reps, and sets for each exercise  
**So that** I can track progressive overload and see my strength gains

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] Each exercise in a session shows target sets (e.g., 3 × 10)
- [ ] User taps a checkbox or button to mark a set as done
- [ ] User can enter weight used (lbs or kg, based on profile)
- [ ] User can enter reps completed (numeric)
- [ ] Optional RPE (rate of perceived exertion) input
- [ ] Previous session's weights/reps shown as reference
- [ ] Auto-populates weight from last session (user can override)

**Technical Notes:**
- `workout_session_exercises` table: session_id, exercise_name, set_number, weight, reps, rpe, completed
- Last session data queried from most recent completed session for same exercise

---

### US-WORKOUT-4: Rest Timer

**As a** user  
**I want** an automatic rest timer between sets  
**So that** I can maintain consistent rest intervals without watching a clock

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] Timer starts automatically when a set is marked complete
- [ ] Default timer duration: 90s (configurable per exercise plan)
- [ ] Timer shows countdown with visual progress ring
- [ ] Timer notification/vibration when time is up
- [ ] User can pause, skip, or extend the timer
- [ ] Timer pauses if app goes to background (resumes on return)
- [ ] Timer does not block navigation (user can review next exercise while resting)

**Technical Notes:**
- Local notification or in-app sound/vibration for timer completion
- Timer state managed in `useWorkoutStore`

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

## Story Dependencies

```
US-WORKOUT-1 (view plan) ──→ US-WORKOUT-2 (start session)
                                    │
                            ┌───────┼───────┐
                            ↓       ↓       ↓
                    (exercise)  (rest)  (complete)
                       │          │         │
                       ↓          ↓         ↓
                 US-WORKOUT-3  US-WORKOUT-4 │
                                            ↓
                                    US-WORKOUT-5 (history)
```

## Edge Cases

- **Skipped exercises:** User can skip an exercise (mark as skipped with reason)
- **Mid-session exit:** Session saves progress, user can resume within same day
- **Plan completion:** When all days in a plan are completed, suggest "Generate new plan" or congratulate
- **Weight unit mismatch:** Session respects profile weight unit (kg/lbs), converts display if needed
- **Empty workout day:** If a scheduled day has no exercises, show "Rest day" or allow custom exercise entry