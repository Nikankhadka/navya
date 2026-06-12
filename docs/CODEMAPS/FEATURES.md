# Features Codemap

**Last Updated:** 2026-06-13

## Feature Modules Overview

Each feature in `src/features/` follows this internal structure:
```
feature-name/
  api/       → Service classes and API calls (Supabase queries)
  hooks/     → TanStack Query hooks and custom React hooks
  screens/   → Screen components (default-exported for Expo Router)
  components/→ Feature-specific UI components
  types.ts   → Feature domain types
  index.ts   → Barrel exports (public API)
```

---

## auth

**Purpose:** Magic-link authentication (login, callback handling)

**Location:** `src/features/auth/`

**Key Files:**
- `components/AuthForm.tsx` — email input + send magic link UI
- `screens/LoginScreen.tsx` — login page (default export for route)
- `screens/AuthCallbackScreen.tsx` — handles deep-link callback after email tap
- `screens/AuthStateHandler.tsx` — manages auth loading/error states

**Public API (index.ts):**
| Export | Type | Description |
|--------|------|-------------|
| `AuthForm` | Component | Email form for magic link sign-in |

**Dependencies:** `@/lib/supabase/client`, `@/lib/auth/redirects`, `@/store/useAuthStore`

---

## coach

**Purpose:** AI-powered fitness coach chat with quick replies and weekly summaries

**Location:** `src/features/coach/`

**Key Files:**
- `api/coach.service.ts` — sends user messages, fetches coach responses
- `api/featureFlag.service.ts` — fetches per-user feature flag toggles
- `hooks/useCoachActions.ts` — mutation hook for sending coach actions
- `hooks/useCoachMessages.ts` — fetches paginated chat history
- `hooks/useFeatureFlags.ts` — fetches AI/food/notification feature flags
- `hooks/useWeeklyCoachSummary.ts` — fetches AI-generated weekly summary
- `components/ChatBubble.tsx` — message bubble (coach vs user styling)
- `components/ChatInput.tsx` — text input with send button
- `components/QuickReplies.tsx` — preset quick reply buttons
- `screens/CoachScreen.tsx` — full coach chat UI
- `types.ts` — `CoachActionType`, `CoachMessage`, `FeatureFlags`

**Public API (index.ts):**
| Export | Type | Description |
|--------|------|-------------|
| `coachService` | Service | Coach chat API calls |
| `featureFlagService` | Service | Feature flag API calls |
| `useCoachActions` | Hook | Send coach messages |
| `useCoachMessages` | Hook | Fetch coach chat history |
| `useFeatureFlags` | Hook | Fetch feature flags |
| `CoachActionType` | Type | Action type union |
| `CoachMessage` | Type | Chat message shape |
| `FeatureFlags` | Type | Feature flag shape |

**Dependencies:** `@/lib/supabase/client`, `@tanstack/react-query`, `@/store/useAuthStore`

**Backend:** `supabase/functions/coach-action/` (Edge Function → OpenAI)

---

## demo

**Purpose:** Mock data for visual testing and demo mode (no backend required)

**Location:** `src/features/demo/`

**Key Files:**
- `mockProfile.ts` — `MOCK_PROFILE`, `MOCK_WEIGHT_LOGS`
- `mockWorkout.ts` — `MOCK_PLAN`, `MOCK_TODAY_SESSION`, `MOCK_WORKOUT_HISTORY`
- `mockNutrition.ts` — `MOCK_DAILY_NUTRITION`, `MOCK_FOOD_SEARCH_RESULTS`
- `mockCoach.ts` — `MOCK_COACH_MESSAGES`, `COACH_QUICK_REPLIES`, `DEMO_COACH_RESPONSES`
- `mockData.ts` — backward-compatible re-export barrel

**Public API (index.ts):**
| Export | Type | Description |
|--------|------|-------------|
| `MOCK_PROFILE` | UserProfile | Full demo user profile |
| `MOCK_WEIGHT_LOGS` | WeightLog[] | 30 days of weight data |
| `MOCK_PLAN` | WorkoutPlan | Push/Pull/Legs plan |
| `MOCK_TODAY_SESSION` | WorkoutSession | In-progress session |
| `MOCK_WORKOUT_HISTORY` | WorkoutHistorySummary | 30 days history |
| `MOCK_DAILY_NUTRITION` | DailyNutritionSummary | Today's food logs |
| `MOCK_FOOD_SEARCH_RESULTS` | FoodSearchResult[] | Search results |
| `MOCK_COACH_MESSAGES` | CoachMessage[] | Chat history |
| `COACH_QUICK_REPLIES` | string[] | Quick reply options |
| `DEMO_COACH_RESPONSES` | Record | Keyword → response map |

**Dependencies:** `@/types/app`

---

## home

**Purpose:** Dashboard home screen showing daily completion and habit streaks

**Location:** `src/features/home/`

**Key Files:**
- `api/habit.service.ts` — fetches streak and activity data
- `hooks/useHabitStreak.ts` — React Query hook for streak data
- `screens/HomeScreen.tsx` — dashboard UI (default export)
- `types.ts` — `HabitStreakSummary`

**Public API (index.ts):**
| Export | Type | Description |
|--------|------|-------------|
| `habitService` | Service | Habit streak API calls |
| `useHabitStreak` | Hook | Fetch streak data |
| `HabitStreakSummary` | Type | Streak data shape |

**Dependencies:** `@/lib/supabase/client`, `@tanstack/react-query`

---

## nutrition

**Purpose:** Food logging, macro tracking, offline food database, meal templates

**Location:** `src/features/nutrition/`

**Key Files:**
- `api/nutrition.service.ts` — CRUD for food logs, custom foods, favorites
- `api/nutrition.repository.ts` — offline-first SQLite repository
- `api/nutritionRepository.helpers.ts` — helper utilities for the repository
- `api/nutritionRepository.queries.ts` — SQL queries for the local DB
- `api/template.service.ts` — meal template CRUD
- `db/nutritionDatabase.init.ts` — SQLite database initialization
- `db/nutritionDatabase.native.ts` — native platform DB adapter
- `db/nutritionDatabase.web.ts` — web platform DB adapter (OPFS)
- `hooks/useDailyNutrition.ts` — fetches day's meals, macros, water
- `hooks/useFoodSearch.ts` — searches food catalog (offline + API)
- `hooks/useNutritionActions.ts` — mutations (log food, favorite, custom)
- `hooks/useMealTemplates.ts` — fetch/manage meal templates
- `components/FoodSearchSheet.tsx` — bottom sheet food search
- `components/ManualMealSheet.tsx` — manual meal entry form
- `components/MealSection.tsx` — meal group (breakfast/lunch/dinner/snack)
- `components/MacroSummaryHeader.tsx` — calorie/protein/carbs/fat rings
- `components/MealTemplatesSheet.tsx` — meal template picker
- `components/WaterTracker.tsx` — water intake tracker
- `screens/NutritionScreen.tsx` — nutrition dashboard (default export)
- `utils/foodCalculations.ts` — portion/nutrient math helpers
- `types.ts` — FoodLog, FoodSearchResult, DailyNutritionSummary, MealTemplate, etc.

**Public API (index.ts):**
| Export | Type | Description |
|--------|------|-------------|
| `nutritionService` | Service | Food log, custom food, favorite API |
| `nutritionRepository` | Repository | Offline-first SQLite DB layer |
| `useDailyNutrition` | Hook | Fetch day's nutrition data |
| `useFoodSearch` | Hook | Search food catalog |
| `useNutritionActions` | Hook | Mutate food logs |
| `getDefaultFoodPortion` | Util | Get default serving size |
| `calculateFoodLogNutrients` | Util | Calculate macro totals |

**Dependencies:** `expo-sqlite`, `@/lib/supabase/client`, `@tanstack/react-query`

---

## onboarding

**Purpose:** Multi-step onboarding flow collecting user profile data

**Location:** `src/features/onboarding/`

**Key Files:**
- `screens/WelcomeScreen.tsx` — intro / welcome page
- `screens/BasicsScreen.tsx` — name, age, gender, country
- `screens/BodyScreen.tsx` — height, weight, goal weight
- `screens/GoalScreen.tsx` — fitness goal, experience level
- `screens/PreferencesScreen.tsx` — diet, equipment, weekly frequency, glow focus
- `screens/CompleteScreen.tsx` — summary + finalize profile

**Public API (index.ts):** No named exports — all screens default-exported for Expo Router.

**Dependencies:** `@/store/useOnboardingStore`, `@/features/profile/api/profile.service`, `@/types/app`

---

## profile

**Purpose:** User profile view/edit, weight tracking, progress stats

**Location:** `src/features/profile/`

**Key Files:**
- `api/profile.service.ts` — fetch/update user profile
- `api/progress.service.ts` — weight log CRUD
- `hooks/useProfile.ts` — fetch current user profile
- `hooks/useWeightActions.ts` — log weight entries
- `hooks/useWeightProgress.ts` — fetch weight trend/history
- `components/ProfileHeader.tsx` — avatar, name, goal display
- `components/ProfileStatsSection.tsx` — stats cards
- `components/WeightCheckInModal.tsx` — weight entry form
- `components/EditProfileModal.tsx` — profile editing form
- `screens/ProfileScreen.tsx` — profile dashboard (default export)
- `types.ts` — UserProfile, GoalType, ActivityLevel, ExperienceLevel, EquipmentType, WeightLog, WeightProgressSummary

**Public API (index.ts):**
| Export | Type | Description |
|--------|------|-------------|
| `profileService` | Service | Profile CRUD API |
| `progressService` | Service | Weight log CRUD API |
| `useProfile` | Hook | Fetch user profile |
| `useWeightActions` | Hook | Log/edit weight entries |
| `useWeightProgress` | Hook | Fetch weight history |

**Dependencies:** `@/lib/supabase/client`, `@tanstack/react-query`, `@/store/useAuthStore`

---

## workout

**Purpose:** Workout plan display, session tracking, set logging, history

**Location:** `src/features/workout/`

**Key Files:**
- `api/workout.service.ts` — fetch workout history summary
- `api/workoutPlan.service.ts` — fetch/create active workout plan
- `api/workoutSession.service.ts` — start/complete/abandon sessions, log sets
- `data/splitTemplates.ts` — predefined workout split templates
- `hooks/useActivePlan.ts` — fetch current workout plan
- `hooks/useTodaySession.ts` — fetch/manage today's session
- `hooks/useWorkoutActions.ts` — mutations (start, log set, complete)
- `hooks/useWorkoutHistory.ts` — workout history & adherence
- `components/ExerciseRow.tsx` — single exercise with sets/reps
- `components/PlanDayCard.tsx` — plan day summary card
- `components/PlanDayModal.tsx` — plan day detail modal
- `components/SessionDetailModal.tsx` — completed session detail
- `components/SetLoggingSheet.tsx` — set weight/reps logging
- `components/PostHocLoggingSheet.tsx` — log past workout
- `components/SplitSelectionSheet.tsx` — choose workout split
- `components/SessionCompleteCard.tsx` — post-workout summary
- `components/TimerDisplay.tsx` — rest timer between sets
- `components/WorkoutStats.tsx` — adherence/stats cards
- `screens/WorkoutScreen.tsx` — workout dashboard (default export)
- `types.ts` — Exercise, WorkoutPlan, WorkoutPlanDay, PlanExercise, WorkoutSession, SessionExercise, CompletedSet, MuscleGroup, DayOfWeek, etc.

**Public API (index.ts):**
| Export | Type | Description |
|--------|------|-------------|
| `workoutService` | Service | Workout history API |
| `ExerciseRow` | Component | Exercise display row |
| `PlanDayCard` | Component | Plan day summary card |
| `useActivePlan` | Hook | Fetch active plan |
| `useTodaySession` | Hook | Today's workout session |
| `useWorkoutActions` | Hook | Session/exercise mutations |
| `useWorkoutHistory` | Hook | Workout history & stats |

**Dependencies:** `@/lib/supabase/client`, `@tanstack/react-query`, `@/store/useWorkoutStore`

---

## Shared Components

### UI Components (`src/components/ui/`)
Reusable, themable primitives with no feature logic:

| Component | File | Purpose |
|-----------|------|---------|
| `Badge` | Badge.tsx | Status/count badge |
| `Button` | Button.tsx | Primary/secondary/ghost buttons |
| `Calendar` | Calendar.tsx | Month calendar with activity dots |
| `Card` | Card.tsx | Container card with variants |
| `DateNavBar` | DateNavBar.tsx | Date navigation arrows |
| `Divider` | Divider.tsx | Horizontal rule |
| `EmptyState` | EmptyState.tsx | Empty data placeholder |
| `Input` | Input.tsx | Text input with label |
| `SectionHeader` | SectionHeader.tsx | Section title with optional action |
| `TabIcon` | TabIcon.tsx | Bottom tab bar icon |
| `ThemeModeToggle` | ThemeModeToggle.tsx | Dark/light/system toggle |
| `Alert` | Alert.tsx | Success/warning/error alert |

### Layout Components (`src/components/layout/`)
| Component | File | Purpose |
|-----------|------|---------|
| `WebWrapper` | WebWrapper.tsx | Centers content on web with max-width constraint |

### Shared Feature Components (`src/components/shared/`)
Cross-feature card components used on the HomeScreen dashboard:

| Component | File | Purpose |
|-----------|------|---------|
| `TodaySessionCard` | TodaySessionCard.tsx | Today's workout quick view |
| `NutritionCard` | NutritionCard.tsx | Today's nutrition summary |
| `ProgressCard` | ProgressCard.tsx | Weight progress quick view |
| `CoachCard` | CoachCard.tsx | Latest coach message |
| `DiaryCompletionCard` | DiaryCompletionCard.tsx | Diary completion grid |
| `WeightTrendCard` | WeightTrendCard.tsx | Weight trend mini-chart |
| `WeeklyCoachSummaryCard` | WeeklyCoachSummaryCard.tsx | Weekly AI summary |
| `MacroRing` | MacroRing.tsx | Animated macro ring |

---

## State Stores (`src/store/`)

| Store | File | Purpose | Persisted? |
|-------|------|---------|------------|
| `useAuthStore` | useAuthStore.ts | Session, user profile, auth state | Yes (SecureStore) |
| `useDateStore` | useDateStore.ts | Currently selected date | No |
| `useOnboardingStore` | useOnboardingStore.ts | Multi-step form data | No |
| `useThemeStore` | useThemeStore.ts | Dark/light/system preference | Yes (AsyncStorage) |
| `useWorkoutStore` | useWorkoutStore.ts | Rest timer, active set tracking | No |
