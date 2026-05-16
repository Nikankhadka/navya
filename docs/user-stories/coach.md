# User Stories: AI Coach

## Epic

As a user, I want an AI coach that understands my goals, recent activity, and progress so that I can get personalised fitness guidance, weekly summaries, and plan adjustments without needing a human personal trainer.

---

## Stories

### US-COACH-1: Coach Messaging

**As a** user  
**I want** to send messages to my AI coach and get contextual responses  
**So that** I can ask questions about my training, nutrition, or progress

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] Coach tab shows a chat-style messaging interface
- [ ] User can type and send messages
- [ ] Coach responds with contextual answers based on user's profile and recent activity
- [ ] Responses are concise (2–5 sentences typical)
- [ ] Chat history persists across app restarts (stored in DB)
- [ ] Messages are scoped to fitness topics only (not open-ended AI chat)
- [ ] Typing indicator shown while coach generates response
- [ ] Error handling if AI provider is unavailable (fallback message)
- [ ] User can clear chat history

**Technical Notes:**
- AI powered by OpenAI via Supabase Edge Function (`supabase/functions/coach-action/`)
- Context includes: profile data, recent food logs, recent workouts, streak, goals
- Message history in `coach_messages` table: user_id, role (user/assistant), content, created_at
- API cost constraint: ~A$50/mo budget cap for all AI operations

---

### US-COACH-2: Context-Aware Responses

**As a** user  
**I want** the coach to know my recent activity (workouts, nutrition, progress)  
**So that** I don't have to re-explain my situation every time I ask a question

**Status:** ✅ Built (Sprint 2)

**Acceptance Criteria:**
- [ ] Coach automatically has access to: last 7 days of workouts, today's food log, current streak, profile goals
- [ ] If user asks "Should I train today?", coach considers last workout date and recovery
- [ ] If user asks about nutrition, coach considers today's calories and macros
- [ ] Coach references user's goal (lose weight, gain muscle, etc.) in responses
- [ ] User does not need to manually provide context

**Technical Notes:**
- Edge function builds a context payload from DB queries before calling OpenAI
- Context window limited to recent data (last 7 days for workouts, today for nutrition)
- Prompt engineering scopes the assistant's role and knowledge boundaries

---

### US-COACH-3: Weekly Coach Summary

**As a** user  
**I want** to receive a weekly coach summary on Home  
**So that** I can reflect on my week's performance and get guidance for the next week

**Status:** 📋 Planned (Sprint 5)

**Acceptance Criteria:**
- [ ] Weekly summary generated every Monday (or first app open of the week)
- [ ] Summary includes: workouts completed vs. planned, nutrition adherence %, streak outcome
- [ ] Coach provides 1–2 actionable suggestions for the upcoming week
- [ ] Summary is 3–5 sentences, scannable
- [ ] Summary appears as a card on Home (Coach card or dedicated weekly card)
- [ ] User can tap to expand or view full summary in Coach tab
- [ ] Old summaries are archived in chat history
- [ ] Generation respects API budget (no summary if budget is exceeded)

**Technical Notes:**
- Edge function runs weekly aggregation query + OpenAI call
- Result cached to avoid regenerating on every app open
- Could be triggered by a scheduled Supabase cron or on-demand on first weekly open

---

### US-COACH-4: Regenerate Workout Plan

**As a** user  
**I want** to request a new workout plan from my coach  
**So that** I can change my routine when I get bored or need to progress

**Status:** 📋 Planned (Sprint 5)

**Acceptance Criteria:**
- [ ] "Regenerate Workout Plan" action available in Workout tab or Coach chat
- [ ] Coach asks for preferences: same goal? same frequency? any exercises to include/avoid?
- [ ] Coach generates a new plan respecting: goal, frequency, experience, available equipment
- [ ] New plan replaces the current workout plan
- [ ] Generation respects API budget constraints
- [ ] User can cancel regeneration
- [ ] Previous plan is archived (not deleted) in case user wants to revert
- [ ] Generation takes < 15 seconds (loading state with progress info)

**Technical Notes:**
- Edge function calls OpenAI with structured prompt to output plan JSON
- Output validated before writing to `workout_plans` table
- Old plan kept with `status = 'archived'` for potential revert
- Constrained generation: no exercises outside user's equipment/experience

---

## Story Dependencies

```
US-COACH-1 (messaging) ──→ US-COACH-2 (context-aware)
                                            ↓
                    US-COACH-3 (weekly summary) ───→ US-COACH-4 (plan regen)
```

## Edge Cases

- **API budget exhausted:** Coach responds with pre-written fallback messages, no AI generation
- **Offline:** Coach chat unavailable — show offline indicator with cached recent history
- **Abuse prevention:** Rate-limiting on coach messages (e.g., max 20 messages per hour)
- **Inappropriate content:** Content filtering on both user messages and coach responses
- **Context staleness:** If user hasn't logged anything in 7+ days, coach acknowledges gap in responses