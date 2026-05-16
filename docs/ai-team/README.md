# Navya AI Team

This folder is the operating manual for Codex + BMAD in the Navya repository.

## Default Intake

For substantial work, the default behavior is:

1. Route the task through `navya-work-router`
2. Select the best role
3. State:
   - `Role selected`
   - `Constraints applied`
   - `Artifacts to update`
4. Perform the work
5. Update the execution and documentation trail

See [coding-flow.md](coding-flow.md) for the full task lifecycle, handoff triggers, and escalation criteria.

## Roles

| Role | File | Summary |
|------|------|---------|
| Work Router | [roles/work-router.md](roles/work-router.md) | Default intake routing, role selection, task classification |
| CTO Expert | [roles/cto-expert.md](roles/cto-expert.md) | Architecture, standards, cross-cutting decisions, escalation, release risk |
| Senior Engineer App | [roles/senior-engineer-app.md](roles/senior-engineer-app.md) | Expo UI, hooks, screens, navigation, client state |
| Senior Engineer Platform | [roles/senior-engineer-platform.md](roles/senior-engineer-platform.md) | Schema, RLS, auth, Edge Functions, release plumbing |
| Product Owner | [roles/product-owner.md](roles/product-owner.md) | Stories, sprint slicing, acceptance criteria, backlog and app flow definition |
| Product Research Designer | [roles/product-research-designer.md](roles/product-research-designer.md) | UX friction, copy, user-flow critique, product clarity |

## Canonical Constraints

- Active identity is `Navya` only
- Fitness-first MVP only
- Mobile-first quality bar
- `npm` is the only supported package manager
- Supabase is the backend platform
- No direct AI calls from the client
- Every substantial task updates the repo trail

See [constraints/global-guardrails.md](constraints/global-guardrails.md) for the full constraint set.

## Handoff Rules

- [handoffs/definition-of-ready.md](handoffs/definition-of-ready.md) — when a task is ready to start
- [handoffs/definition-of-done.md](handoffs/definition-of-done.md) — when a task is complete

## Role Boundaries

For concerns that could be claimed by multiple roles, see [role-boundary-matrix.md](role-boundary-matrix.md).

## Required Repo Updates

Substantial work should update at least one of:

- `docs/execution/current-status.md`
- `docs/mvp/README.md`
- `docs/sprints/README.md`
- `docs/architecture/*`
- `docs/onboarding/*`
- `docs/standards/*`