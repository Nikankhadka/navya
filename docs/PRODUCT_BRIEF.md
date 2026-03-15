# Product Brief: Navya (v1.0 MVP)

**Navya** is an **all-in-one AI "glow coach"** designed for the **Australian (AU)** and **Nepalese (NP)** markets. It is a comprehensive beauty, skin, hair, and fitness platform.

**Current Focus:** We are currently executing **Phase 1: Fitness & Health Foundations**, which provides the metabolic and physiological baseline for the broader "glow" transformation.

---

## 1. Product Vision
To provide premium-level health coaching for the price of a coffee, leveraging local insights and "readiness-first" logic to differentiate from generic, exercise-heavy fitness apps.

## 2. Target Audience
*   **Australia:** Urban professionals and suburban parents seeking low-friction nature integration and longevity-focused movement.
*   **Nepal:** Middle-class urban dwellers in Kathmandu/Pokhara interested in a blend of traditional Ayurvedic health and modern fitness.

## 3. Core MVP Features ("The Niche Hooks")

### A. Navya Readiness Score (The Logic Hook)
*   **What:** A daily proprietary score (0-100) calculated locally on the device.
*   **Inputs:** Self-reported sleep quality, muscle soreness, and previous day's activity load.
*   **Benefit:** Gives the user a "permission slip" to either push hard or rest, similar to high-end wearables but without the hardware cost.

### B. Nature-Integrated Movement (AU Focus)
*   **What:** Guided "outdoor micro-rituals" that encourage users to step outside for mobility and breathwork.
*   **Benefit:** Addresses the "gym burnout" and aligns with the AU value of outdoor connection.

### C. Modern Ayurveda Check-ins (NP Focus)
*   **What:** Daily check-ins for mood, digestion, and energy based on traditional health principles.
*   **Benefit:** Provides a familiar cultural frame for wellness that global apps ignore.

## 4. Technical Architecture (Lean & Reliable)
*   **Stack:** Expo (React Native), Supabase (Auth/DB/Realtime), Tailwind (NativeWind).
*   **AI Protocol:** Centralized coaching logic via Supabase Edge Functions to OpenAI; heavy use of client-side deterministic logic to keep infra costs under **A$50/month**.
*   **Data Model:** Modular domain-driven design (Auth, Profile, Workout, Nutrition, AI).

## 5. Success Metrics
*   **Retention:** 30%+ of users completing a "Ready Check" 5+ days/week.
*   **Cost Management:** Total infrastructure burn stays below A$50/mo for first 1,000 users.
*   **Onboarding Completion:** 70%+ of signups completing the customized 6-step flow.

---

## 6. Roadmap Summary
1.  **Phase 1:** Onboarding Flow & readiness baseline (In-Progress)
2.  **Phase 2:** Local Readiness Score Logic
3.  **Phase 3:** localized Content Modules (Nature Rituals & Ayurvedic Tips)
4.  **Phase 4:** AI Coaching Integration (Edge Functions)
