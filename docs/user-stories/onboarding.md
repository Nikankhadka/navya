# User Stories: Auth & Onboarding

## Epic

As a first-time user, I want to sign up quickly and configure my fitness profile so that Navya can personalise my goals, workouts, and nutrition targets from day one.

---

## Stories

### US-ONBOARD-1: Sign Up / Log In

**As a** new user  
**I want** to sign up using email, Google, or Apple  
**So that** I can create an account with minimal friction

**Status:** ✅ Built (Sprint 1)

**Acceptance Criteria:**
- [ ] User can sign up with email + OTP verification
- [ ] User can sign up / log in with Google OAuth
- [ ] User can sign up / log in with Apple OAuth
- [ ] Successful auth redirects to onboarding (if first time) or Home (if returning)
- [ ] Auth errors display inline (invalid email, network failure, account exists)
- [ ] Session persists across app restarts

**Technical Notes:**
- Supabase Auth with email OTP, Google, Apple providers
- Session handled by `useAuthStore` (Zustand) + Supabase client
- Auth gate in `AuthGate.tsx` controls root navigation split

---

### US-ONBOARD-2: Welcome Screen

**As a** new user  
**I want** to see a branded welcome screen  
**So that** I understand what Navya is and feel guided into setup

**Status:** ✅ Built (Sprint 1)

**Acceptance Criteria:**
- [ ] Welcome screen shows app name, tagline, and "Get Started" CTA
- [ ] Tapping "Get Started" navigates to Basics screen
- [ ] Screen is skippable only if already onboarded
- [ ] Branding matches app theme (light/dark mode)

---

### US-ONBOARD-3: Basics — Name, Age, Gender

**As a** new user  
**I want** to enter my name, age, and gender  
**So that** Navya can personalise my experience and calculate baseline metrics

**Status:** ✅ Built (Sprint 1)

**Acceptance Criteria:**
- [ ] User can enter first name (required)
- [ ] User can enter age (numeric, 13–120 validation)
- [ ] User can select gender (male, female, other / prefer not to say)
- [ ] "Next" is disabled until required fields are filled
- [ ] Back navigation returns to Welcome screen
- [ ] Data persists in onboarding store until submission

---

### US-ONBOARD-4: Body — Height, Weight, Units

**As a** new user  
**I want** to enter my height and weight with my preferred units  
**So that** Navya can calculate BMI, BMR, and set calorie/macro baselines

**Status:** ✅ Built (Sprint 1)

**Acceptance Criteria:**
- [ ] User can enter weight (numeric, with unit toggle: kg / lbs)
- [ ] User can enter height (numeric, with unit toggle: cm / ft+in)
- [ ] Unit preference is saved to profile and used throughout the app
- [ ] "Next" is disabled until both fields are filled
- [ ] Back navigation returns to Basics screen

**Technical Notes:**
- Unit preference stored in `profiles` table as `weight_unit` and `height_unit`
- Used downstream in nutrition calculations and progress tracking

---

### US-ONBOARD-5: Goal — Fitness Goal + Activity Level

**As a** new user  
**I want** to select my primary fitness goal and activity level  
**So that** Navya can recommend appropriate calorie targets and workout frequency

**Status:** ✅ Built (Sprint 1)

**Acceptance Criteria:**
- [ ] User can select a primary goal: lose weight, maintain, gain muscle, improve fitness
- [ ] User can select activity level: sedentary, light, moderate, active, very active
- [ ] Goal selection updates displayed workout frequency suggestion
- [ ] "Next" is disabled until both selections are made
- [ ] Back navigation returns to Body screen

**Technical Notes:**
- Goal and activity level feed into TDEE calculation and workout plan generation
- Exercise frequency defaults based on goal + activity combo

---

### US-ONBOARD-6: Preferences — Workout Days, Diet, Experience

**As a** new user  
**I want** to set my workout preferences (days per week, diet preference, experience level)  
**So that** Navya tailors my workout plan and nutrition suggestions

**Status:** ✅ Built (Sprint 1)

**Acceptance Criteria:**
- [ ] User selects days per week available for workouts (1–7 picker)
- [ ] User selects diet preference (balanced, low-carb, high-protein, vegetarian, vegan, keto)
- [ ] User selects experience level (beginner, intermediate, advanced)
- [ ] All fields have sensible defaults pre-filled
- [ ] "Next" navigates to Complete screen
- [ ] Back navigation returns to Goal screen

---

### US-ONBOARD-7: Complete — Onboarding Summary + Confirm

**As a** new user  
**I want** to review a summary of my onboarding selections  
**So that** I can confirm everything is correct before starting

**Status:** ✅ Built (Sprint 1)

**Acceptance Criteria:**
- [ ] Summary screen displays all selections: name, age, gender, height, weight, goal, activity level, workout days, diet, experience
- [ ] "Start My Journey" button submits the complete profile to Supabase
- [ ] On submission, `onboarding_complete` flag is set to true
- [ ] Successful submission navigates to Home tab
- [ ] User can go back to edit any section
- [ ] Loading state shown during submission
- [ ] Error state shown if submission fails (with retry)

**Technical Notes:**
- On submission writes to `profiles` table in Supabase
- `useOnboardingStore` manages multi-screen state, cleared on successful submit
- After completion, user never sees onboarding flow again

---

## Story Dependencies

```
US-ONBOARD-2 → US-ONBOARD-3 → US-ONBOARD-4 → US-ONBOARD-5 → US-ONBOARD-6 → US-ONBOARD-7
                                                                                      ↓
                                                                             US-ONBOARD-1 (auth required)
```

## Edge Cases

- **Re-onboarding:** If `profiles` schema adds new fields, existing users see only the new fields (not full flow)
- **Incomplete onboarding:** If user exits mid-flow, they resume from where they left off
- **Offline:** Onboarding requires network (Supabase submit). App should warn if offline at submission time