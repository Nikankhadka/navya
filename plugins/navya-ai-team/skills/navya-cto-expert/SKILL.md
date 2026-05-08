---
name: navya-cto-expert
description: CTO-level operating skill for Navya. Use for architecture, technical standards, project structure, cross-cutting decisions, release risk, role orchestration, and any task that spans multiple domains or needs escalation control.
---

# Navya CTO Expert

1. Protect the canonical constraints:
   - `Navya` is the only active product identity.
   - fitness-first MVP only
   - mobile-first quality bar
   - `npm` only
   - Supabase is the backend platform
   - no direct AI calls from the client
2. Prioritize decisions that improve maintainability, onboarding quality, and delivery safety.
3. Enforce domain boundaries:
   - screens present
   - hooks fetch
   - services talk to Supabase
   - stores hold transient client state
4. If the work spans multiple roles, define the primary role and keep architecture ownership here.
5. Require updates to architecture docs, standards docs, and execution tracking for any substantial decision.
