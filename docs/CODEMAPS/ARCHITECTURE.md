# Architecture Codemap

**Last Updated:** 2026-06-13

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Expo App (React Native)                       │
│                                                                      │
│  ┌─────────┐   ┌───────────────────────────────────────────────┐   │
│  │  Auth   │   │                AppProviders                    │   │
│  │  Gate   │──▶│  (QueryClient → Theme → SafeArea → WebWrap)   │   │
│  └─────────┘   └───────────────────────────────────────────────┘   │
│       │                            │                                 │
│       ▼                            ▼                                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Expo Router (Stack)                        │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────┐               │   │
│  │  │  (auth)  │  │ (onboarding) │  │  (tabs)   │               │   │
│  │  │ login    │  │ welcome..    │  │ home      │               │   │
│  │  │ callback │  │ complete     │  │ workout   │               │   │
│  │  └──────────┘  └──────────────┘  │ nutrition │               │   │
│  │                                  │ coach     │               │   │
│  │                                  │ profile   │               │   │
│  │                                  │ daily-diary              │   │
│  │                                  └──────────┘               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   Feature Modules                              │   │
│  │  ┌────────┐ ┌────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐  │   │
│  │  │  auth  │ │ coach  │ │ nutrition│ │profile │ │ workout │  │   │
│  │  │screen  │ │screen  │ │  screen  │ │screen  │ │ screen  │  │   │
│  │  │hooks   │ │hooks   │ │  hooks   │ │hooks   │ │ hooks   │  │   │
│  │  │service │ │service │ │  service │ │service │ │ service │  │   │
│  │  └────────┘ └────────┘ └──────────┘ └────────┘ └─────────┘  │   │
│  │  ┌────────┐ ┌────────┐                                        │   │
│  │  │  home  │ │  demo  │ (mock data for visual testing)         │   │
│  │  │screen  │ │ mock*  │                                        │   │
│  │  │hooks   │ └────────┘                                        │   │
│  │  └────────┘                                                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
          │                                  │
          ▼                                  ▼
┌──────────────────┐              ┌──────────────────────────┐
│   Supabase       │              │   OpenAI (Edge Functions) │
│  ┌────────────┐  │              │  ┌──────────────────────┐ │
│  │ Auth       │  │              │  │ coach-action         │ │
│  │ (magic lnk)│  │              │  │ coach-weekly-summary │ │
│  ├────────────┤  │              │  └──────────────────────┘ │
│  │ Postgres   │  │              └──────────────────────────┘ │
│  │ + RLS      │  │
│  └────────────┘  │
└──────────────────┘
```

## Data Flow

### Authentication Flow
```
User taps login → LoginScreen → supabase.auth.signInWithOtp()
                                    │
                                    ▼
                            Magic link email sent
                                    │
                            User taps link → callback.tsx
                                    │
                            createSessionFromUrl() → exchange code → set session
                                    │
                            AuthGate checks session → redirects to (tabs) or (onboarding)
```

### Daily User Loop
```
Open app → AuthGate validates session → HomeScreen loads
  │
  ├─ Home: shows today's completion status, streak, coach insight
  ├─ Workout: today's session with sets/reps logging
  ├─ Nutrition: food search → log meals → macro tracking
  ├─ Coach: AI chat with quick replies + weekly summaries
  └─ Profile: weight tracking, stats, settings
```

### State Architecture
```
┌────────────────────────────────────────────────┐
│              Zustand (Client State)             │
│  useAuthStore    — session, user profile       │
│  useDateStore    — selected date navigation    │
│  useOnboardingStore — multi-step form state    │
│  useThemeStore   — persisted theme preference  │
│  useWorkoutStore — timer, active set tracking  │
└────────────────────────────────────────────────┘
                        │
┌────────────────────────────────────────────────┐
│           TanStack Query (Server State)         │
│  useDailyNutrition   — day's meals + macros    │
│  useActivePlan       — current workout plan    │
│  useTodaySession     — today's workout session │
│  useCoachMessages    — coach chat history      │
│  useProfile          — user profile data       │
│  useWeightProgress   — weight trend data       │
│  useHabitStreak      — diary completion streak │
└────────────────────────────────────────────────┘
```

## Key Architecture Decisions
1. **Feature-first structure** — each domain has its own api/, hooks/, screens/, components/
2. **Barrel exports** — every feature has index.ts re-exporting its public API
3. **Expo Router thin routes** — route files delegate to feature screen components
4. **Supabase Edge Functions** — AI calls proxied through backend, never from client
5. **Demo mode** — mock data in `features/demo/` for visual testing without backend
