# UI Verification Flow

This document outlines the standard path to navigate through all screens in the Navya application to check for UI consistency and premium aesthetics.

## Application Architecture
Navya uses Expo Router with the following group structures:
1. **(auth)**: Authentication screens.
2. **(onboarding)**: For new users to set up their profile.
3. **(tabs)**: The main application dashboard and features.

---

## 1. Authentication Flow
**Goal:** Verify the login experience and brand impression.

- **Route:** `/(auth)/login`
- **Expected UI:** Premium dark-mode design, stacked email/password entry, a primary login button, inline auth links, and Google/Apple social login buttons.
- **Deep Link:** `navya://(auth)/login`

---

## 2. Onboarding Flow
**Goal:** Verify the multi-step profile setup process.

Users are redirected here if `isAuthenticated` is true but `onboarding_complete` is false.

| Step | Page | Route | Key Elements to Check |
| :--- | :--- | :--- | :--- |
| 1 | Welcome | `/(onboarding)/welcome` | High-impact hero image, value proposition. |
| 2 | Basics | `/(onboarding)/basics` | Form fields (Name, Birthdate), input styling. |
| 3 | Body | `/(onboarding)/body` | Height/Weight pickers, unit toggles. |
| 4 | Goal | `/(onboarding)/goal` | Selection cards for fitness goals. |
| 5 | Preferences | `/(onboarding)/preferences` | Focus chips, training preferences, notification toggles. |
| 6 | Complete | `/(onboarding)/complete` | Success animation, "Get Started" button. |

**Deep Links:**
- `navya://(onboarding)/welcome`
- `navya://(onboarding)/basics`
- `navya://(onboarding)/body`
- `navya://(onboarding)/goal`
- `navya://(onboarding)/preferences`
- `navya://(onboarding)/complete`

---

## 3. Main Application (Tabs)
**Goal:** Verify the core application features and navigation.

| Tab | Page | Route | Key Elements to Check |
| :--- | :--- | :--- | :--- |
| **Home** | Today | `/(tabs)/index` | Readiness Score gauge, daily summary cards. |
| **Fitness** | Workout | `/(tabs)/workout` | Exercise lists, workout detail views. |
| **Nutrition** | Health | `/(tabs)/nutrition` | Meal tracking, calorie progress bars. |
| **Coach** | AI Coach | `/(tabs)/coach` | Chat interface, AI response styling. |
| **Profile** | Settings | `/(tabs)/profile` | User info, account management, logout. |

**Deep Links:**
- `navya://(tabs)/`
- `navya://(tabs)/workout`
- `navya://(tabs)/nutrition`
- `navya://(tabs)/coach`
- `navya://(tabs)/profile`

---

## Quick Verification Script
You can use the following command to jump to any page (requires `npx uri-scheme` should be installed or run via expo):

```bash
# Example: Jump to Onboarding Goals
npm run open-route navya://(onboarding)/goal -- --android
# OR
npm run open-route navya://(onboarding)/goal -- --ios
```
