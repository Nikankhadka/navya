---
name: navya-work-router
description: Route Navya work through the correct project role, apply the matching constraints, and record the selected role, constraints applied, and artifacts to update. Use for any substantial Navya task when Codex is the primary interface and the correct role must be inferred automatically.
---

# Navya Work Router

1. Read `docs/ai-team/README.md` and `docs/execution/current-status.md`.
2. Select the dominant role:
   - `navya-cto-expert` for architecture, standards, cross-cutting decisions, escalation, release risk, and multi-role work
   - `navya-senior-engineer-app` for Expo UI, navigation, hooks, client state, screens, and UX implementation
   - `navya-senior-engineer-platform` for Supabase schema, RLS, auth, functions, release plumbing, and build systems
   - `navya-product-research-designer` for UX research, onboarding friction, competitor review, copy tone, and flow critique
   - `navya-product-owner` for stories, sprint slicing, acceptance criteria, backlog ordering, and app flow definition
3. If the task is ambiguous or spans multiple roles, default to `navya-cto-expert`.
4. Begin substantial work with:
   - `Role selected: ...`
   - `Constraints applied: ...`
   - `Artifacts to update: ...`
5. Execute the task using the selected role skill as the operating constraint set.
6. Update the relevant docs and always refresh `docs/execution/current-status.md` before finishing.
