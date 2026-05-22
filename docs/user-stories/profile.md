# User Stories: Profile & Settings

## Epic

As a user, I want to manage my personal information, goals, and preferences from a single Profile screen so that I can keep my fitness plan aligned with my changing needs.

---

## Stories

### US-PROFILE-1: Edit Personal Information & Goals

**As a** user  
**I want** to edit my name, age, gender, height, weight, and fitness goal  
**So that** I can keep my profile accurate as my circumstances change

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] Profile screen shows current values for all editable fields
- [ ] Tapping a field opens an edit modal or inline editor
- [ ] Editable fields: first name, age, gender, height, weight, goal, activity level
- [ ] Unit preference respected in weight/height displays (kg/lbs, cm/ft)
- [ ] Changes save to Supabase and reflect immediately
- [ ] Validation on all numeric fields (age 13–120, weight > 0, height > 0)
- [ ] Cancel discards changes without saving
- [ ] "Save" disabled if no changes made

**Technical Notes:**
- Writes to `profiles` table in Supabase
- Optimistic update via TanStack Query mutation, rollback on error
- Changing goal or activity level may trigger recalculation of calorie/macro targets

---

### US-PROFILE-2: Body Stats Display

**As a** user  
**I want** to see my current body stats (BMI, BMR, TDEE) on my profile  
**So that** I understand my baseline metrics

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] BMI displayed (calculated from height + weight)
- [ ] BMI category shown (underweight, normal, overweight, obese)
- [ ] BMR displayed (calculated using Mifflin-St Jeor formula)
- [ ] TDEE displayed (BMR × activity multiplier)
- [ ] Daily calorie target displayed (TDEE + goal adjustment)
- [ ] Daily macro targets shown (protein, carbs, fat) in grams
- [ ] Stats recalculate when weight or goal changes
- [ ] Values are for reference only (disclaimer if needed)

**Technical Notes:**
- Calculations done client-side from profile data
- Formulas:
  - BMI = weight_kg / (height_m)²
  - BMR (Mifflin-St Jeor): 10w + 6.25h - 5a + s (where s = +5 male, -161 female)
  - TDEE = BMR × activity_multiplier
  - Calorie target = TDEE ± goal_adjustment (deficit/surplus)

---

### US-PROFILE-3: Preferences (Theme, Units, Notifications)

**As a** user  
**I want** to configure app preferences like theme, units, and notifications  
**So that** the app works the way I like

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] Theme toggle: light mode, dark mode, system default
- [ ] Unit preferences: weight (kg/lbs), height (cm/ft+in), water (ml/oz), distance (km/miles)
- [ ] Notification toggles: workout reminders, meal logging reminders, weekly summary
- [ ] Preferences persist across app restarts and devices
- [ ] Changes apply immediately without requiring app restart
- [ ] Default preferences set from onboarding selections

**Technical Notes:**
- Theme managed by `useThemeStore` (Zustand) with persistence
- Unit preferences stored in `profiles` table
- Notification preferences stored in `profiles` or separate `user_preferences` table
- Push notification tokens managed separately via `push_tokens` table

---

### US-PROFILE-4: Account Management

**As a** user  
**I want** to manage my account settings (email, logout, delete)  
**So that** I have control over my account and data

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] Profile shows current email (read-only, from auth provider)
- [ ] "Log Out" button with confirmation dialog
- [ ] Logout clears local state and returns to auth screen
- [ ] "Delete Account" option with confirmation (requires retyping "DELETE")
- [ ] Account deletion removes user data per privacy policy
- [ ] Support/contact option shown (link or email)

**Technical Notes:**
- Logout: clears Zustand stores, Supabase session, and navigation reset
- Delete: Supabase Admin API or Edge Function for full account deletion
- Cascade deletion must handle: profiles, food_logs, workout_sessions, coach_messages, water_logs, progress_logs

---

## Story Dependencies

```
US-PROFILE-1 (edit info) ──→ US-PROFILE-2 (body stats recalculate)
       │
       └──→ US-PROFILE-3 (preferences — independent)
       
US-PROFILE-4 (account — independent)
```

## Edge Cases

- **First-time profile view:** All fields show onboarding values — no "empty" state for core fields
- **Unit conversion:** If user switches from kg to lbs, all displayed values convert correctly
- **Goal change recalculation:** Changing from "lose weight" to "gain muscle" updates calorie target + macro split
- **Account deletion:** Soft-delete or hard-delete with mandatory confirmation step
- **Missing calculation inputs:** If height or weight missing, BMI/BMR/TDEE show "Update your profile to see stats"