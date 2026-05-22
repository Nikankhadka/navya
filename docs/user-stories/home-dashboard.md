# User Stories: Home Dashboard

## Epic

As a daily user, I want a single Home screen that shows my complete fitness state — nutrition, workout, progress, and coach guidance — so that I can understand my day at a glance and take action without navigating multiple tabs.

---

## Stories

### US-HOME-1: Greeting & Streak Display

**As a** returning user  
**I want** to see a personalised greeting and my current streak  
**So that** I feel recognised and motivated to maintain consistency

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] Greeting changes based on time of day (morning/afternoon/evening)
- [ ] Greeting includes user's first name from profile
- [ ] Streak chip shows 🔥 icon + current consecutive day count
- [ ] Streak is derived from real data (workout completion, not mock)
- [ ] Streak resets to 0 after a missed day (configured window)

**Technical Notes:**
- Streak computed from `workout_sessions` completion dates
- `useHabitStreak` hook in `src/features/home/`
- Streak logic: consecutive days with at least one completed workout session

---

### US-HOME-2: Weekly Activity Row

**As a** user  
**I want** to see a 7-day overview of my activity (worked out or not)  
**So that** I can quickly assess how consistent I've been this week

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] 7 dots represent the current week (Mon–Sun or today's week view)
- [ ] Completed days show a green checkmark ✓
- [ ] Rest/uncompleted days show an empty dot
- [ ] Today is highlighted if not yet completed
- [ ] Tapping a dot shows the day name

**Technical Notes:**
- Weekly data from `workout_sessions` filtered to current week
- Uses boolean[7] in `HabitStreakSummary` type

---

### US-HOME-3: Today's Session Card

**As a** user  
**I want** to see today's scheduled workout on Home  
**So that** I can start or continue my workout without navigating to the Workout tab

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] Card shows workout day name (e.g., "Day 3: Upper Body")
- [ ] Card shows exercise count and estimated duration
- [ ] Progress bar reflects completion % if session in progress
- [ ] "Start Workout →" button shown for unstarted sessions
- [ ] "Continue Workout →" button shown for in-progress sessions
- [ ] ✅ "Completed" badge shown for finished sessions
- [ ] Tapping navigates to live workout or workout tab
- [ ] Empty state if no workout scheduled today

**Technical Notes:**
- Reads from `workout_plans` and `workout_sessions` tables
- Session state tracked in `useWorkoutStore`

---

### US-HOME-4: Nutrition Today Card

**As a** user  
**I want** to see my daily nutrition summary on Home  
**So that** I know how many calories and macros I've consumed without opening the Nutrition tab

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] Card shows calories consumed vs. goal (e.g., "1,432 / 2,000")
- [ ] Progress bar or ring for calorie percentage
- [ ] Macro breakdown shown: protein, carbs, fat rings or bars
- [ ] Hydration progress shown (glasses/cups consumed vs. target)
- [ ] Tapping navigates to Nutrition tab
- [ ] Empty state if no food logged today ("Log your first meal")
- [ ] Real-time updates when food is logged from Nutrition tab

**Technical Notes:**
- Aggregates from `food_logs` for current day
- Water intake from `water_logs` table
- Targets from profile's calorie/macro goals
- `MacroRing` component in `src/components/shared/`

---

### US-HOME-5: Progress & Adherence Card

**As a** user  
**I want** to see my weight progress and weekly adherence on Home  
**So that** I can track my long-term trends without digging into Profile

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] Card shows current weight (latest check-in) + change from last week
- [ ] Card shows weekly workout adherence % (e.g., "3/5 days ✅")
- [ ] Card shows date of last completed workout
- [ ] Tapping navigates to Profile tab
- [ ] Empty state if no weight logged ("Log your first weigh-in")

**Technical Notes:**
- Weight from `progress_logs` table (latest entry)
- Adherence computed from `workout_sessions` for current week

---

### US-HOME-6: AI Coach Card

**As a** user  
**I want** to see a daily coach insight or summary on Home  
**So that** I get lightweight guidance without opening the Coach tab

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] Card shows a short AI-generated insight or tip (1–2 lines)
- [ ] Content is contextual (based on recent activity, streaks, or goals)
- [ ] Tapping navigates to Coach tab for full conversation
- [ ] Falls back to a generic motivational message if AI unavailable
- [ ] Card is dismissible (user can hide it for the day)

**Technical Notes:**
- Insight sourced from coach edge function or derived from local data
- Falls back to rotatable motivational quotes if offline

---

### US-HOME-7: Daily Diary Completion State

**As a** user  
**I want** to see an overall "day completeness" indicator on Home  
**So that** I know at a glance if I've logged everything needed today

**Status:** 🚧 Built (Sprint 3)

**Acceptance Criteria:**
- [ ] Indicator shows completion state across: food logged, water target met, workout done, weight logged
- [ ] Each category shows a checkmark or empty state
- [ ] Overall progress ring or summary shows % day complete
- [ ] Tapping an incomplete category navigates to the relevant tab
- [ ] State resets daily

**Technical Notes:**
- Derived from aggregate queries across `food_logs`, `water_logs`, `workout_sessions`, `progress_logs`
- All queries scoped to current day

---

## Story Dependencies

```
US-HOME-1, US-HOME-2 (streak data)
       ↓
US-HOME-3 (workout data)
       ↓
US-HOME-4 (nutrition + water data)
       ↓
US-HOME-5 (progress data)
       ↓
US-HOME-6 (coach data)
       ↓
US-HOME-7 (all data sources)
```

## Edge Cases

- **No data today:** All cards show helpful empty states with CTAs
- **First day:** No streak data, no history — show "Start your journey" messaging
- **Midnight rollover:** Dashboard resets cleanly at start of new day
- **Slow data load:** Skeleton loaders for each card section; cards appear as data arrives