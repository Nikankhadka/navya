# Navya AI Team

This folder is the operating manual for the Navya AI development system using the **agent-agnostic system** (in `.agent/`).

## Agent System

Navya's AI agent system uses a single tool-agnostic config:

| System | Location | Use For |
|---|---|---|
| **Agent-Agnostic Config** | `.agent/agents/`, `.agent/commands/`, `.agent/skills/`, `.agent/rules/` | Sub-agent definitions, commands, reusable skills, and coding rules — works with any AI tool |

All agents share the same CLAUDE.md, TASKS.md, and PROJECT_JOURNAL.md context.

## Default Intake

For substantial work, the default behavior is:

1. **Route the task** using `/implement` or `/refine` agent commands
2. **Select the best agent** based on the task type
3. **State the routing preamble:**
   - `Agent selected: [agent name]`
   - `Constraints applied: [guardrails/docs in play]`
   - `Artifacts to update: [files that will change]`
4. **Perform the work** following the coding flow
5. **Update the trail** — TASKS.md, PROJECT_JOURNAL.md, execution status

See [coding-flow.md](coding-flow.md) for the full task lifecycle, handoff triggers, and escalation criteria.

## Agent-Agnostic System (`.agent/`)

These files work with any AI tool — Claude Code, Cursor, Copilot, Cline, or others:

### Primary Agents
| Agent | File | When to Use |
|---|---|---|
| **Work Router** | `.agent/agents/work-router.md` | Default intake routing for all substantial work |
| **Prompt Master** | `.agent/agents/prompt-master.md` | Refine raw prompts before execution — always use first |
| **Technical Designer** | `.agent/agents/technical-designer.md` | Plan architecture before implementation |
| **Task Executor** | `.agent/agents/task-executor.md` | Implement features from an approved plan |
| **Code Reviewer** | `.agent/agents/code-reviewer.md` | Review diffs before commit, review PRs |
| **Product Owner** | `.agent/agents/product-owner.md` | Manage MVP scope and translate product into executable work |
| **Product Research Designer** | `.agent/agents/product-research-designer.md` | Improve UX, flow, and copy clarity |
| **Senior Engineer App** | `.agent/agents/senior-engineer-app.md` | Own client-side delivery quality for Expo/React Native |
| **Senior Engineer Platform** | `.agent/agents/senior-engineer-platform.md` | Own schema, auth, backend integration, and release plumbing |
| **CTO Expert** | `.agent/agents/cto-expert.md` | Architecture decisions and escalation for cross-domain issues |

### Specialized Agents
| Agent | File | When to Use |
|---|---|---|
| **Diagnostic Agent** | `.agent/agents/diagnostic-agent.md` | Diagnose complex bugs and system issues |

### Commands
| Command | File | Description |
|---|---|---|
| `/review` | `.agent/commands/review.md` | Review current diff as a senior engineer |
| `/implement` | `.agent/commands/implement.md` | Implement a feature from spec |
| `/diagnose` | `.agent/commands/diagnose.md` | Diagnose a bug or error |
| `/refine` | `.agent/commands/refine.md` | Refine raw prompts before execution |

### Skills
| Skill | File | Description |
|---|---|---|
| Coding Standards | `.agent/skills/coding-standards.md` | TypeScript and React Native coding rules |
| Testing Principles | `.agent/skills/testing-principles.md` | What to test, how to test it |
| Security Checklist | `.agent/skills/security-checklist.md` | Security review checklist for AI output |
| Prompt Master | `.agent/skills/prompt-master.md` | Refine and optimize prompts before execution |

### Rules
| Rule | File | Description |
|---|---|---|
| General | `.agent/rules/general.mdc` | Coding behavior rules |
| TypeScript | `.agent/rules/typescript.mdc` | TypeScript strict rules |
| Testing | `.agent/rules/testing.mdc` | Testing standards and patterns |

## Cline Integration

Cline is fully integrated with Navya's agent system:

| Component | Integration Details |
|---|---|
| **Agent Orchestration** | Cline operates as the primary orchestration system, managing all agent roles |
| **Prompt Refinement** | Built-in PROMPT framework application for all substantial tasks |
| **Workflow Management** | Follows the same task lifecycle: Spec → Plan → Build → Verify → Commit |
| **Context Management** | Adheres to Navya's context rules and shared memory system |
| **Tool Operations** | Leverages MCP servers (GitHub, Supabase, Filesystem) |
| **Quality Assurance** | Maintains same output standards across all AI systems |

### Cline Workflow
1. **Always use `/refine` first** for substantial tasks
2. **State agent role and constraints** at task start
3. **Follow context management rules** (0-50% free, 50-70% aware, 70-85% compact, 85%+ end session)
4. **Maintain agent-agnostic output** - same quality regardless of AI model
5. **Update shared memory** (TASKS.md, PROJECT_JOURNAL.md)
6. **Follow Cline-specific patterns** as defined in `docs/ai-team/cline-workflow.md`

### Cross-Model Consistency
- All AI systems follow the same agent definitions in `.agent/`
- Same PROMPT framework application
- Same output quality standards
- Same file operations patterns
- Same context management rules

## Canonical Constraints

- Active identity is `Navya` only
- Fitness-first MVP only
- Mobile-first quality bar
- `npm` is the only supported package manager
- Supabase is the backend platform
- No direct AI calls from the client
- Every substantial task updates the repo trail

## Handoff Rules

- [handoffs/definition-of-done.md](handoffs/definition-of-done.md) — comprehensive checklist for task completion

## Role Boundaries

For concerns that could be claimed by multiple roles, see [role-boundary-matrix.md](role-boundary-matrix.md).

## PR Review Protocol

1. AI auto-review runs on every PR (using `/review` command)
2. AI flags CRITICAL and MAJOR issues
3. Author addresses or rebuts each item
4. Human review focuses on architecture and product logic — not style
5. AI review doesn't block merge; it informs human review

## Preventing Context Drift (Team Size Issue)

In larger teams, AI agents trained on different context windows produce inconsistent output. Mitigate with:
- CLAUDE.md describes the "one true way" for each common pattern
- Shared `.agent/rules/` committed to repo
- Weekly "AI hygiene" session: review AI-generated PRs for drift from standards

## Required Repo Updates

Substantial work should update at least one of:

- `TASKS.md` — Sprint task board
- `PROJECT_JOURNAL.md` — Cross-session memory
- `docs/execution/current-status.md` — Active execution state
- `docs/mvp/README.md` — MVP scope changes
- `docs/sprints/README.md` — Sprint planning
- `docs/architecture/README.md` — Architecture decisions
- `docs/onboarding/README.md` — Developer setup
- `docs/standards/*` — Engineering and security standards