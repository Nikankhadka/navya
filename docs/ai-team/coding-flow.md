# Navya Coding Flow

This document describes how a task moves through roles in the Navya AI team — from intake to completion. Think of it as the routing protocol for all substantial work.

```
┌─────────────────────────────────────────────────────────────┐
│                       1. INTAKE                             │
│   User provides a task description                          │
│   ↓                                                         │
│   Work Router classifies:                                   │
│   ├─ Is the role obvious? → Route directly                  │
│   └─ Ambiguous / multi-role? → Escalate to CTO Expert       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     2. ROUTING PREAMBLE                      │
│   Selected role states:                                     │
│   1. "Role selected: [role name]"                           │
│   2. "Constraints applied: [guardrails/docs in play]"       │
│   3. "Artifacts to update: [files that will change]"        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   3. EXECUTION (per role)                    │
│                                                                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│   │  PO           │  │ Sr Eng App   │  │ Sr Eng Plat  │     │
│   │  Stories,     │  │ Screens,     │  │ Schema,      │     │
│   │  acceptance,  │  │ hooks, nav,  │  │ RLS, auth,   │     │
│   │  backlog      │  │ state        │  │ migrations   │     │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│          │                │                │              │
│   ┌──────┴───────┐  ┌──────┴───────┐                       │
│   │ PRD (Design) │  │ CTO Expert   │                       │
│   │ UX, copy,    │  │ Architecture,│                       │
│   │ flow review  │  │ standards,   │                       │
│   │              │  │ escalation   │                       │
│   └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  4. HANDOFF TRIGGERS                        │
│                                                                                             │
│   During execution, a role may need to hand off:            │
│   ├─ Cross-domain dependency (e.g., app needs new API)      │
│   │   → Coordinate laterally: App ↔ Platform               │
│   ├─ Scope or priority question                             │
│   │   → Coordinate with PO                                  │
│   ├─ UX concern                                             │
│   │   → Coordinate with PRD                                 │
│   ├─ Architecture risk / ambiguity                          │
│   │   → Escalate to CTO Expert                              │
│   └─ Blocked by external factor                             │
│       → Escalate to CTO Expert for resolution               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               5. COMPLETION & TRAIL UPDATE                   │
│                                                                                             │
│   Definition of Done checklist:                             │
│   ├─ Implementation is complete                             │
│   ├─ npm run typecheck passes                               │
│   ├─ Relevant smoke checks pass                             │
│   ├─ Docs are updated (see Artifacts to update)   
if possible do browser testing with playwright the for the feature u built           │
│   └─ docs/execution/current-status.md records:              │
│       • What changed                                        │
│       • What comes next                                     │
└─────────────────────────────────────────────────────────────┘
```

## Default Intake Preamble

When a task enters via the Work Router, the selected role must state:

```
Role selected: [role name]
Constraints applied: [list of relevant guardrails or doc boundaries]
Artifacts to update: [list of files that will be touched]
```

## When to Escalate to CTO Expert

Escalate immediately if any of these are true:

| Trigger | Example |
|---------|---------|
| Task spans multiple domains | A feature needs new migration + new screen + new RLS all at once |
| Role is unclear | Task could be app work or platform work |
| Architecture decision needed | Should we add a new table or use an existing one? |
| Release risk | Change affects auth, deployment, or environment config |
| Scope boundary crossed | Feature request stretches MVP definition |
| Conflict between roles | App and Platform disagree on contract approach |

## When to Coordinate Laterally

Coordinate directly (without CTO) when:

| Pair | Typical Coordination |
|------|---------------------|
| App ↔ Platform | API contract shape, generated types, Edge Function interface |
| App ↔ PRD | UX flow feedback, copy suggestions, screen state validation |
| PO ↔ PRD | Flow definition, user research, competitive positioning |
| PO ↔ App/Platform | Technical feasibility during story refinement |

## Role-to-Skill Map

Each role corresponds to a BMAD skill in `plugins/navya-ai-team/skills/`:

| Role | BMAD Skill |
|------|-----------|
| CTO Expert | `navya-cto-expert` |
| Senior Engineer App | `navya-senior-engineer-app` |
| Senior Engineer Platform | `navya-senior-engineer-platform` |
| Product Owner | `navya-product-owner` |
| Product Research Designer | `navya-product-research-designer` |
| Work Router | `navya-work-router` |