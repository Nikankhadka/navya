# User Stories: Progress & Adherence

## Epic

As a goal-oriented user, I want to track my body measurements, see my progress over time, and understand how consistently I'm sticking to my plan so that I can stay motivated and adjust my approach as needed.

---

## Stories

### US-PROGRESS-1: Weight Check-In

**As a** user  
**I want** to log my weight regularly  
**So that** I can track my body weight trend over time

**Status:** ✅ Built (Sprint 3)

**Acceptance Criteria:**
- [ ] Weight check-in available from Profile and Home
- [ ] User can enter weight (numeric, with unit from profile: kg or lbs)
- [ ] Quick-entry: one field + save (no multi-step form)
- [ ] Check-in is timestamped for trend calculation
- [ ] Latest weight displayed on Home and Profile
- [ ] Change from last check-in shown (e.g., "-0.5 kg this week")
- [ ] User can view all past weight check-ins
- [ ] Delete/edit past check-ins (with confirmation)

**Technical Notes:**
- Writes to `progress_logs` table (migration `20260508_mvp_phase2_progress_logs.sql`)
- Schema: user_id, date, weight_kg, body_fat (optional), notes (optional), created_at
- RLS policies scoped to own user_id
- Weight delta computed from last two entries

---

### US-PROGRESS-2: Progress History (Weight Trend)

**As a** user  
**I want** to see my weight history as a chart or list  
**So that** I can visualise my long-term trend

**Status:** 📋 Planned (Sprint 4)

**Acceptance Criteria:**
- [ ] Progress history accessible from Profile or dedicated progress section
- [ ] Line chart shows weight over time (last 7 days, 30 days, 90 days)
- [ ] Each data point is a logged check-in
- [ ] Chart shows goal line (target weight from profile) as reference
- [ ] User can toggle between kg and lbs
- [ ] Empty state if no check-ins logged ("Log your first weigh-in to see your trend")
- [ ] Summary stats shown: start weight, current weight, total change, lowest, highest
- [ ] Tapping a data point shows exact value and date

**Technical Notes:**
- Uses `react-native-chart-kit` or a lightweight charting library
- Data from `progress_logs` ordered by date
- Goal weight from `profiles.goal_weight` field

---

### US-PROGRESS-3: Workout Adherence

**As a** user  
**I want** to see how consistently I'm completing my scheduled workouts  
**So that** I can hold myself accountable and identify patterns

**Status:** 🚧 In Progress (Sprint 3)

**Acceptance Criteria:**
- [ ] Adherence shown as percentage (e.g., "75% this week")
- [ ] Weekly view: "3 of 4 planned sessions completed"
- [ ] Monthly view: adherence % across all scheduled days
- [ ] Adherence data shown on Home (Progress card) and Profile
- [ ] Current streak shown alongside adherence
- [ ] No placeholders — all data derived from `workout_sessions`
- [ ] Empty state: "No workouts logged yet — start your first session!"

**Technical Notes:**
- Adherence = completed_sessions / planned_sessions for the period
- Planned sessions from `workout_plans` schedule
- Completed sessions from `workout_sessions` where status = 'completed'

---

### US-PROGRESS-4: Body Progress Photos (Future)

**As a** user  
**I want** to optionally take and store progress photos  
**So that** I can visually compare my body transformation over time

**Status:** 📋 Planned (Post-MVP)

**Acceptance Criteria:**
- [ ] Option to take a progress photo within the app
- [ ] Photos are organised by date taken
- [ ] Before/after comparison view (side-by-side or swipe)
- [ ] Photos stored securely (Supabase Storage, RLS-protected)
- [ ] User can delete photos
- [ ] Camera permissions handled gracefully
- [ ] Photos do not appear in any shareable or social feature

**Technical Notes:**
- Stretch goal — explicitly deferred from MVP
- Requires Supabase Storage bucket with RLS
- No social sharing capability (privacy-first)

---

## Story Dependencies

```
US-PROGRESS-1 (weight check-in)
       │
       ├──→ US-PROGRESS-2 (weight chart)
       │
US-PROGRESS-3 (adherence) ──→ uses workout_sessions
       │
US-PROGRESS-4 (photos) ──→ Post-MVP
```

## Edge Cases

- **No data period:** Chart shows empty state guidance, not a broken graph
- **Duplicate check-in same day:** Store all check-ins; show average or latest for daily view
- **Weight spikes:** Chart should handle outlier data points gracefully (no axis breakage)
- **Adherence with no plan:** If no plan assigned, adherence shows "Set up your workout plan first"
- **Progress photos storage limits:** Enforce storage quota per user (e.g., 50 photos)