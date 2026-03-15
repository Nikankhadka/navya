# CODING_AGENT_RULES.md

## Purpose
This file is the **authoritative coding contract** for any coding agent working on this project.

Every coding task must pass through this document **before implementation begins**.

The goal is to ensure:
- consistent architecture
- efficient execution
- senior-level engineering discipline
- strong TypeScript quality
- clean product-focused delivery
- controlled scope and cost
- maintainable long-term evolution

If a new task conflicts with this document, the agent must:
1. stop,
2. identify the conflict clearly,
3. propose the smallest safe path forward,
4. update the decision record if the approach changes.

---

## Project Context

This project is an **AI-powered fitness and wellness application** for the **Australian and Nepalese** market.

### Current MVP scope
The initial MVP focuses on:
- user onboarding
- fitness record tracking
- workout logging
- food input and calorie tracking
- personalised AI fitness tips and guidance
- mobile-first UX with basic web support
- modular architecture that can scale later

### Deferred future scope
These are intentionally **not MVP requirements**, but should remain possible later:
- beauty/self-improvement features
- skin-related modules
- hair/grooming features
- visual-model-based guidance
- subscriptions and monetisation layers
- richer analytics
- multilingual experiences

---

## Non-Negotiable Product Constraints

### 1. Cost ceiling
The system must be designed to operate leanly.

Current working constraint:
- target infra cost should remain around **A$50/month or below** in early-stage operation

This means:
- avoid unnecessary vendors
- avoid always-on servers when serverless is enough
- avoid heavy AI usage patterns
- prefer structured outputs over expensive long-form conversational flows
- do not add infrastructure that materially increases monthly burn without strong justification

### 2. User scale target
The initial system should comfortably support:
- roughly **1,000 users**
- and be modular enough to scale toward **2,000+ users** without requiring a rewrite

### 3. Product positioning
This is **not** a medical app.
This is **not** a diagnostic or treatment platform.

The agent must avoid implementing functionality that implies:
- diagnosis
- treatment
- rehab planning
- medical claims
- unsafe health advice

---

## Core Technical Constraints

## Approved stack
The current approved stack is:

### Frontend
- Expo
- React Native
- TypeScript
- Expo Router

### Backend
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Edge Functions
- Supabase scheduled/background functions when needed

### AI
- OpenAI API through backend only
- never direct provider calls from the client app

### Client utilities
- TanStack Query
- Zustand
- expo-secure-store
- expo-notifications
- expo-sqlite only if clearly justified later

No alternative framework, backend, or state library should be introduced casually.

Any deviation requires:
- a clear technical reason
- tradeoff analysis
- impact on cost
- impact on maintainability
- an ADR update

---

## Architecture Rules

### 1. Never overbuild early
The project should use:
- one app
- one backend platform
- one database
- one main AI gateway
- one repo

Do **not** introduce microservices unless the current architecture is clearly failing.

### 2. Strong modular structure
Even if the system is not split into services, the codebase must be modular by domain.

Preferred domain boundaries:
- auth
- profile
- workouts
- nutrition
- ai
- notifications
- analytics
- shared/ui
- shared/lib
- shared/types

### 3. No direct AI access from the client
The mobile/web client must **never** call the AI provider directly.

All AI operations must go through a backend function such as:
- create_plan
- adjust_workout
- nutrition_tip
- daily_coach
- weekly_summary

### 4. Store structured data
The system must not rely on raw AI prose as the primary source of truth.

AI outputs should be:
- validated
- typed
- stored as structured JSON or relational records
- versioned where appropriate

### 5. Prefer product logic over AI logic
Do not use AI for logic that should be deterministic in application code.

Use normal code for:
- validation
- business rules
- thresholds
- state transitions
- permissions
- filtering
- formatting
- calculations that do not require reasoning

Use AI only for:
- plan generation
- response personalization
- contextual summaries
- constrained recommendations

---

## Senior Engineer Operating Principles

Every coding task must follow these principles.

### 1. Clarify intent before coding
The agent must understand:
- what problem is being solved
- what the user actually wants
- what is in scope
- what is explicitly out of scope
- what could break if the change is made

Do not rush into code without understanding the task.

### 2. Choose the simplest design that will survive change
Avoid:
- premature abstraction
- speculative generality
- clever but fragile solutions
- hidden magic
- deep inheritance or unnecessary indirection

Prefer:
- explicit code
- small functions
- composable modules
- transparent data flow
- patterns the next engineer can understand quickly

### 3. Make invalid states hard to represent
Good engineering here means:
- strict typing
- explicit enums/unions
- narrow interfaces
- validation at boundaries
- constrained inputs
- typed return values

### 4. Design for maintainers, not just compilers
Code should be:
- readable
- unsurprising
- well named
- intentionally structured
- easy to debug
- easy to extend

### 5. Protect future speed
The agent must optimize for:
- long-term development speed
- confidence in changes
- low regression risk
- low onboarding friction for future contributors

---

## Mandatory Pre-Execution Checklist

Before starting any coding task, the agent must answer these questions internally:

1. What is the exact problem?
2. Which domain does this belong to?
3. Does this change fit the approved architecture?
4. Is this necessary for MVP, or is it premature?
5. Does this introduce extra vendor, infra, or maintenance cost?
6. Can this be implemented with existing patterns and utilities?
7. What types, schemas, and validation boundaries are affected?
8. What are the failure modes?
9. What tests or verification steps are needed?
10. Does this change require an ADR update?

If the agent cannot answer these clearly, it should not start coding yet.

---

## Strong TypeScript Rules

This codebase must remain a **strong TypeScript application**.

### Required standards
- use `strict` TypeScript settings
- no silent `any`
- no broad `unknown` without narrowing
- no unsafe casting unless carefully justified
- prefer discriminated unions over stringly-typed branching
- prefer exact domain models over loose object maps
- type all public functions
- type hook return values
- type external API payloads
- validate runtime data before trusting it

### Avoid
- `any` as a shortcut
- massive “utility” types that hide intent
- overcomplicated generic abstractions
- type assertions used to bypass correctness
- passing around unvalidated JSON as if it were trusted domain data

### Required runtime boundaries
TypeScript is not enough by itself.
All external inputs must be validated:
- API responses
- Supabase results where shape is uncertain
- environment variables
- AI outputs
- route params when needed
- storage reads

If a value crosses a trust boundary, validate it.

---

## React Native / Expo Rules

### 1. Build mobile-first, keep web compatible
The primary experience is mobile.
Web support should be:
- functional
- clean
- responsive
- not an afterthought

But the UI should not sacrifice mobile quality in order to behave like a desktop web app.

### 2. Use platform-safe UI patterns
Prefer:
- simple layouts
- responsive spacing
- reusable primitives
- accessible components
- touch-friendly interactions

Avoid:
- brittle absolute positioning
- platform-specific hacks unless necessary
- huge component files
- mixing layout, business logic, and data fetching in one place

### 3. Separate concerns
Components should be split clearly:
- presentational UI
- container logic
- hooks
- data services
- domain types

### 4. Keep navigation predictable
Use Expo Router cleanly.
Do not create navigation patterns that are hard to follow or inconsistent across mobile/web.

---

## Supabase Rules

### 1. Auth and data boundaries must be explicit
All user-facing data must be associated with `user_id` where appropriate.

### 2. Use row-level security
Any user-scoped tables should be protected with RLS.

### 3. Migrations are mandatory
Do not make schema changes without:
- a migration
- a clear schema intent
- matching TypeScript updates
- matching docs updates if the domain changed materially

### 4. Avoid hidden database coupling
Do not scatter raw ad hoc queries everywhere.
Prefer:
- typed data access helpers
- domain-specific services
- clear query boundaries

### 5. Be careful with realtime and storage
Do not add realtime features or heavy media flows unless there is clear product need.
They increase complexity and cost.

---

## AI Integration Rules

### 1. AI is a constrained subsystem, not the whole app
The app is a product with AI assistance.
It is not a chat wrapper.

### 2. AI requests must be intentional
Only invoke AI when there is clear user value.

Examples of good use:
- generate a workout plan
- adjust a workout for time/soreness
- provide short contextual guidance
- generate a weekly summary
- offer a simple nutrition suggestion

Examples of bad use:
- continuous unbounded chat
- AI for deterministic logic
- AI as a substitute for proper product design
- expensive long-context calls without strong reason

### 3. Minimize prompt size
The agent must:
- avoid replaying entire histories
- use summaries instead of full transcripts
- include only relevant user context
- avoid unnecessary tokens

### 4. Validate model outputs
AI outputs must be:
- schema-constrained when possible
- validated before use
- rejected or repaired safely if malformed

### 5. Keep AI provider swap possible
Do not tightly couple product logic to a single model response style.

---

## Performance and UX Rules

### 1. Fast first, fancy later
For MVP, prioritize:
- responsiveness
- clarity
- reliable flows
- fast screen load
- smooth interaction

Do not introduce expensive animations or heavy UI effects unless they materially improve the product.

### 2. Avoid unnecessary rerenders
The agent should:
- memoize where it matters
- keep state local when possible
- avoid global state for everything
- avoid mixing remote and local state unnecessarily

### 3. Loading and error states are required
Every async flow should have:
- loading state
- success state
- empty state where relevant
- error state
- retry path where sensible

---

## File and Folder Discipline

The project must remain understandable at a glance.

### Required standards
- keep file names clear and predictable
- keep components small and focused
- avoid giant “misc” or “utils” dumping grounds
- prefer domain-oriented placement
- avoid circular dependencies
- keep shared code truly shared

### Naming guidance
Prefer names that communicate role:
- `WorkoutPlanCard`
- `useWorkoutHistory`
- `createPlanInputSchema`
- `nutritionService`
- `ProfileScreen`

Avoid vague names like:
- `helper`
- `manager`
- `common`
- `stuff`
- `dataUtil`

unless the scope is genuinely obvious and justified.

---

## Testing and Verification Rules

### Minimum expectation
The agent must verify:
- types compile logically
- no obvious broken imports or architecture mismatches
- happy path works conceptually
- edge cases are considered
- loading/error states exist

### Prioritize testing for
- domain logic
- input validation
- schema handling
- AI output parsing
- hooks with meaningful branching
- critical user flows

### At minimum, before considering a task “done”
The agent should check:
- types
- routes
- data flow
- state assumptions
- null/undefined handling
- auth assumptions
- platform implications

---

## Documentation Rules

A senior engineer does not only write code.
They leave a trail that keeps the team fast.

### Required documentation behavior
When a meaningful technical decision is made, the agent should update:
- README if setup or usage changed
- relevant domain docs if behavior changed
- ADRs if architecture or patterns changed
- this file if new permanent coding rules are introduced

### Skeleton change rule
If a task changes the project skeleton, one of the following must be updated:
- ADR
- project README
- folder structure explanation
- setup/run docs

---

## ADR Rules

This project should maintain lightweight decision records.

A new ADR should be added when:
- a major library is introduced
- architecture changes materially
- state management approach changes
- AI integration strategy changes
- auth/data model patterns change
- deployment model changes
- a notable tradeoff is intentionally accepted

ADR format should include:
- title
- status
- context
- decision
- consequences

Do not create ADRs for trivial code edits.

---

## Security and Privacy Rules

### 1. Never expose secrets
No provider keys or service-role credentials in the client app.

### 2. Least privilege by default
Use the smallest access scope needed.

### 3. Protect user data
Do not log or expose sensitive data casually.

### 4. Be careful with health-adjacent features
Because this app touches fitness and food:
- avoid medical language unless explicitly supported and approved
- avoid implying professional diagnosis
- avoid features that create preventable compliance risk

---

## Definition of Done for Coding Tasks

A coding task is only done when:

1. the change solves the requested problem,
2. the implementation fits the approved architecture,
3. the TypeScript story is strong,
4. the UX states are handled,
5. the code is readable and maintainable,
6. the change does not introduce obvious scope creep,
7. relevant docs are updated,
8. ADRs are updated if needed,
9. the solution is the simplest reasonable one,
10. future engineers can continue from it without confusion.

---

## Required Delivery Format for Future Coding Tasks

For any non-trivial code task, the agent should think and work in this order:

1. Restate the task briefly
2. Identify affected domain(s)
3. Identify constraints
4. Propose the smallest correct implementation
5. Apply changes
6. Update docs/ADR if needed
7. Summarize what changed
8. Call out follow-up work separately from the completed work

---

## Final Rule
The coding agent must behave like a **disciplined senior engineer**, not a code generator.

That means:
- understand before acting
- prefer clarity over cleverness
- keep the system lean
- protect maintainability
- respect architecture
- respect product scope
- respect cost constraints
- document decisions
- leave the codebase in a better state after every task
