# User Stories: Nutrition & Food Logging

## Epic

As a health-conscious user, I want to log what I eat quickly and accurately so that Navya can track my calorie and macro intake against my goals, without the logging process itself becoming a chore.

---

## Stories

### US-NUTRITION-1: Manual Food Logging

**As a** user  
**I want** to manually enter a food item with its calories and macros  
**So that** I can track my nutrition when I don't have a barcode or database match

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] User can enter food name (free text)
- [ ] User can enter calories (numeric, required)
- [ ] User can enter protein, carbs, fat (numeric, optional, default 0)
- [ ] User can enter serving size and unit (e.g., 100g, 1 cup, 1 serving)
- [ ] User can select meal time (breakfast, lunch, dinner, snack)
- [ ] Logged item appears immediately in the nutrition diary
- [ ] Calories and macros update on Home dashboard immediately
- [ ] Validation: calories must be > 0, negative values rejected

**Technical Notes:**
- Writes to `food_logs` table in Supabase
- `meal_time` enum: 'breakfast', 'lunch', 'dinner', 'snack'

---

### US-NUTRITION-2: Meal-Grouped Diary

**As a** user  
**I want** to see my food diary grouped by meal (breakfast, lunch, dinner, snack)  
**So that** I can understand my nutrition distribution throughout the day

**Status:** ✅ Built (Sprint 3)

**Acceptance Criteria:**
- [ ] Diary is divided into meal sections: Breakfast, Lunch, Dinner, Snack
- [ ] Each section shows total calories and macros for that meal
- [ ] Individual food items are listed within their meal section
- [ ] User can tap a food item to edit or delete it
- [ ] Empty meal sections are hidden or shown with "Add food" prompt
- [ ] Meal sections are ordered chronologically (breakfast → snack)
- [ ] Daily totals shown at the top or bottom of the diary

**Technical Notes:**
- Queries `food_logs` grouped by `meal_time` for current date
- Inline editing uses TanStack Query mutations with optimistic updates

---

### US-NUTRITION-3: Quick-Add Calories and Macros

**As a** busy user  
**I want** to quickly add just calories (and optionally macros) without filling out a full form  
**So that** I can log food in under 5 seconds

**Status:** ✅ Built (Sprint 3)

**Acceptance Criteria:**
- [ ] "Quick Add" button or entry point on Nutrition screen
- [ ] Quick-add modal: numeric field for calories (required)
- [ ] Optional expandable fields for protein, carbs, fat
- [ ] Optional meal time selector (defaults to current time-appropriate meal)
- [ ] Saves as a food log entry with name "Quick Add" or user-defined label
- [ ] Total logging time < 5 seconds for just calories
- [ ] Entry appears immediately in the diary

**Technical Notes:**
- Simplified write path bypasses food search
- Label stored as "Quick Add — {calories} cal" if no name provided

---

### US-NUTRITION-4: Recent Meals and Duplicate Logging

**As a** user who eats similar meals regularly  
**I want** to re-log a recent meal with one tap  
**So that** I don't have to re-enter the same foods every day

**Status:** 🚧 In Progress (Sprint 3)

**Acceptance Criteria:**
- [ ] Recent meals section shows last 10–20 unique logged meals
- [ ] Each recent meal shows name, calories, macros, and date last logged
- [ ] Tapping a recent meal logs it again with current timestamp and selected meal time
- [ ] "Log Again" confirmation with meal time selector (default: current meal time)
- [ ] Duplicate appears as a new entry in today's diary
- [ ] Recent meals persist across app restarts (backend-backed, not just local state)

**Technical Notes:**
- Query `food_logs` for unique food names ordered by most recent
- Deduplication by food name + approximate calorie/macro match
- `recent_foods` table or computed view in Supabase

---

### US-NUTRITION-5: Barcode-Assisted Food Capture

**As a** user  
**I want** to scan a barcode to look up nutrition info  
**So that** I can log packaged foods without manual entry

**Status:** 📋 Planned (Sprint 5, behind feature flag)

**Acceptance Criteria:**
- [ ] Barcode scan button in Nutrition tab (camera icon)
- [ ] Opens device camera for barcode scanning
- [ ] On successful scan, looks up product in USDA or local database
- [ ] Displays product name, serving size, calories, and macros
- [ ] User confirms or adjusts serving size before logging
- [ ] Logs to food diary with source marked as "barcode"
- [ ] Graceful error if barcode not found: offer manual entry fallback
- [ ] Feature is controlled by `enable_barcode_scan` feature flag
- [ ] Camera permissions handled (iOS permission prompt, deny gracefully)

**Technical Notes:**
- Uses device camera via expo-camera or expo-barcode-scanner
- USDA FoodData Central API as primary lookup, local SQLite as cache/fallback
- Feature flag in `feature_flags` table
- Disable-able server-side if API costs exceed budget

---

### US-NUTRITION-6: Offline Nutrition Search

**As a** user with intermittent connectivity  
**I want** to search for foods and log them even when offline  
**So that** my nutrition tracking is never blocked by network issues

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] Food search works with no network connection (uses local SQLite catalog)
- [ ] Local catalog contains USDA foundation foods (~7,000 items)
- [ ] Search results include food name, serving size, calories, macros
- [ ] Results appear within 500ms of typing (local query)
- [ ] Online searches also hit remote USDA API for fresher/richer results
- [ ] Sync queued food logs when connectivity returns
- [ ] Visual indicator for offline mode

**Technical Notes:**
- SQLite database bundled in `assets/nutrition/catalog.db`
- Built from USDA Foundation Foods via `scripts/build-nutrition-catalog.js`
- Search uses SQLite FTS (full-text search) or LIKE queries

---

### US-NUTRITION-7: Meal Templates

**As a** user with regular eating patterns  
**I want** to save and reuse meal templates (e.g., "My usual breakfast")  
**So that** I can log entire meals with one tap

**Status:** 📋 Planned (Sprint 5)

**Acceptance Criteria:**
- [ ] User can save any logged meal as a template with a custom name
- [ ] Templates are grouped: saved by user (custom) and system presets
- [ ] System presets include common breakfasts, lunches, dinners, snacks
- [ ] Tapping a template logs all foods in that template at once
- [ ] Template supports multiple food items in one meal
- [ ] User can edit or delete their saved templates
- [ ] Templates sync across devices (stored in Supabase)

**Technical Notes:**
- `meal_templates` table: user_id, name, meal_time, foods (JSON array of food entries)
- System presets seeded via migration or seed script
- UI: long-press on meal group → "Save as Template"

---

### US-NUTRITION-8: Food Diary Editing and Deletion

**As a** user  
**I want** to edit or delete entries from my food diary  
**So that** I can correct mistakes or remove accidental logs

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] Tapping a food entry opens edit modal
- [ ] User can change: food name, calories, macros, serving size, meal time
- [ ] User can delete the entry with confirmation dialog
- [ ] Changes update totals immediately
- [ ] Swipe-to-delete gesture on diary entries (optional)
- [ ] Undo deletion within 5 seconds (snackbar with undo action)

**Technical Notes:**
- TanStack Query mutation with optimistic update on edit/delete
- Delete sets `deleted_at` soft-delete or hard-deletes row

---

## Story Dependencies

```
US-NUTRITION-1 (manual log) ──→ US-NUTRITION-2 (meal grouping)
       │                              │
       ├──→ US-NUTRITION-3 (quick-add)│
       ├──→ US-NUTRITION-4 (recent)   │
       └──→ US-NUTRITION-5 (barcode)  │
                                       ↓
                              US-NUTRITION-7 (templates)
                                       
US-NUTRITION-6 (offline) ───→ supports all log paths
US-NUTRITION-8 (edit/delete) → supports all log paths
```

## Edge Cases

- **Midnight boundary:** Logged items belong to the day they were created (UTC or user's timezone)
- **Duplicate prevention:** Recent meals deduplication prevents identical entries from appearing 3x
- **Barcode not found:** Clear fallback to manual entry mode with barcode number pre-filled
- **Offline queue conflict:** If a queued offline log duplicates an already-synced item, deduplicate on sync