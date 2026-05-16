# User Stories: Water Tracking

## Epic

As a health-conscious user, I want to track my daily water intake against a personalised goal so that I can stay hydrated and see my hydration status alongside my nutrition.

---

## Stories

### US-WATER-1: Log Water Intake

**As a** user  
**I want** to log water I've consumed with a simple tap  
**So that** I can track my hydration without friction

**Status:** ✅ Built (Sprint 3)

**Acceptance Criteria:**
- [ ] "+" button or tap-to-add interaction on water tracker
- [ ] Tap adds a predefined serving (e.g., 250ml / 8oz)
- [ ] User can customise serving size: 100ml, 200ml, 250ml, 500ml, or custom amount
- [ ] Logged amount shows immediately in the tracker
- [ ] Water log includes timestamp (for hourly distribution if needed later)
- [ ] Multiple logs accumulate through the day

**Technical Notes:**
- Writes to `water_logs` table (migration `20260411_mvp_phase1_water_logs.sql`)
- Schema: user_id, amount_ml, logged_at
- RLS policies scoped to own user_id

---

### US-WATER-2: Daily Water Target

**As a** user  
**I want** to see my daily water target and progress toward it  
**So that** I know how much more I need to drink

**Status:** ✅ Built (Sprint 3)

**Acceptance Criteria:**
- [ ] Water tracker shows target amount (default: calculated from profile or 2L)
- [ ] Progress bar or ring shows current consumption vs. target
- [ ] Text reads "X / Y ml" or "X / Y cups"
- [ ] Target is reached visually (e.g., bar turns green, checkmark appears)
- [ ] Target can be adjusted in Profile or Preferences

**Technical Notes:**
- Target stored in `profiles.water_target_ml` (default: null → use 2000ml)
- Display uses aggregated sum of `water_logs` for current day

---

### US-WATER-3: Water History and Trends

**As a** user  
**I want** to see my water intake history across recent days  
**So that** I can spot hydration patterns and improve my habits

**Status:** 📋 Planned (Sprint 4)

**Acceptance Criteria:**
- [ ] Water history shows last 7 days (daily totals)
- [ ] Each day shows amount consumed vs. target
- [ ] Weekly average displayed
- [ ] Tapping a day shows detailed breakdown (time-of-day logs)
- [ ] History view accessible from Nutrition or Home

**Technical Notes:**
- Query `water_logs` grouped by date, ordered descending
- Simple bar chart or list view for 7-day history

---

## Story Dependencies

```
US-WATER-1 (log) ──→ US-WATER-2 (target display) ──→ US-WATER-3 (history)
```

## Edge Cases

- **Midnight reset:** Water logs reset at start of new day (by date filter, not deletion)
- **Rehydration (gym):** User may log larger amounts post-workout — serving size flexibility covers this
- **Unit switching:** ml vs. oz conversion handled by profile unit preference
- **Empty state first day:** "Drink your first glass!" prompt