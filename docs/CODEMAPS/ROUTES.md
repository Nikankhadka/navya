# Routes Codemap

**Last Updated:** 2026-06-13

## Route Architecture

Expo Router file-based routing with three route groups. All routes are under a root Stack navigator.

```
src/app/
├── _layout.tsx                    Root layout (Providers → AuthGate → Stack)
├── +not-found.tsx                 404 fallback
├── index.tsx                      Splash/entry (redirects via AuthGate)
│
├── (auth)/                        Auth route group (unauthenticated users)
│   ├── _layout.tsx                Stack layout (headerShown: false)
│   ├── login.tsx                  → features/auth/screens/LoginScreen
│   └── callback.tsx               → features/auth/screens/AuthCallbackScreen
│
├── (onboarding)/                  Onboarding route group (new users)
│   ├── _layout.tsx                Stack layout (slide_from_right animation)
│   ├── welcome.tsx                → features/onboarding/screens/WelcomeScreen
│   ├── basics.tsx                 → features/onboarding/screens/BasicsScreen
│   ├── body.tsx                   → features/onboarding/screens/BodyScreen
│   ├── goal.tsx                   → features/onboarding/screens/GoalScreen
│   ├── preferences.tsx            → features/onboarding/screens/PreferencesScreen
│   └── complete.tsx               → features/onboarding/screens/CompleteScreen
│
└── (tabs)/                        Main app (authenticated + onboarded)
    ├── _layout.tsx                → providers/TabsLayout (bottom tabs)
    ├── index.tsx                  → features/home/screens/HomeScreen (Home tab)
    ├── daily-diary.tsx            Calendar date picker (hidden tab)
    ├── workout/                   Workout tab
    │   ├── _layout.tsx            Stack layout
    │   └── index.tsx              → features/workout/screens/WorkoutScreen
    ├── nutrition/                 Nutrition tab
    │   ├── _layout.tsx            Stack layout
    │   └── index.tsx              → features/nutrition/screens/NutritionScreen
    ├── coach/                     Coach tab (feature-flagged)
    │   ├── _layout.tsx            Stack layout
    │   └── index.tsx              → features/coach/screens/CoachScreen
    └── profile/                   Profile tab
        ├── _layout.tsx            Stack layout
        └── index.tsx              → features/profile/screens/ProfileScreen
```

## Route Protection (AuthGate)

The `AuthGate` component in `src/providers/AuthGate.tsx` handles all routing logic:

```
AuthGate checks:
├── Not initialized → Show loading spinner
├── Not authenticated → Redirect to (auth)/login
├── Authenticated, not onboarded → Redirect to (onboarding)/welcome
├── Onboarded, in auth group → Redirect to (tabs)
└── Onboarded, in onboarding → Redirect to (tabs)
```

## Bottom Tab Bar

Defined in `src/providers/TabsLayout.tsx`:

| Tab | Route | Icon | Feature Flag |
|-----|-------|------|--------------|
| Home | `(tabs)/index` (home-outline/home) | Ionicons | Always shown |
| Workout | `(tabs)/workout` (barbell-outline/barbell) | Ionicons | Always shown |
| Food | `(tabs)/nutrition` (restaurant-outline/restaurant) | Ionicons | Always shown |
| Coach | `(tabs)/coach` (chatbubbles-outline/chatbubbles) | Ionicons | `isCoachEnabled` env var |
| Profile | `(tabs)/profile` (person-outline/person) | Ionicons | Always shown |

Hidden tabs (not in tab bar, accessible via navigation):
- `daily-diary` — calendar date picker (navigated from HomeScreen)

## Route File Pattern

All route files follow this thin-wrapper pattern:
```typescript
// src/app/(tabs)/workout/index.tsx
export { default } from '@/features/workout/screens/WorkoutScreen';
```

Screen components are **default-exported** (requirement for Expo Router) and live in feature directories.

## Deep Linking

- **Scheme:** `navya://`
- **Auth callback path:** `navya://callback` (handled by `AuthCallbackScreen`)
- **Web callback:** `{siteUrl}/callback`
- Auth redirect URL generation in `src/lib/auth/redirects.ts`

## Providers Nesting Order

```
RootLayout
  └─ AppProviders
       ├─ QueryClientProvider (@tanstack/react-query)
       └─ AppThemeProvider (dark/light theme context)
            └─ SafeAreaProvider
                 ├─ StatusBar
                 └─ WebWrapper (centers content on web)
                      └─ AuthGate
                           └─ Stack (Expo Router)
```
