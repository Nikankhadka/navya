# Navya Multi-Agent Configuration

This file defines the multi-agent team setup for Navya. It configures how AI sub-agents operate and coordinate.

## Agent Definitions

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

## Skills (Agent-Reusable Knowledge Packages)
These are tool-agnostic skill definitions — use them with any AI agent:

| Skill | File | Description |
|---|---|---|
| Coding Standards | `.agent/skills/coding-standards.md` | TypeScript and React Native coding rules |
| Testing Principles | `.agent/skills/testing-principles.md` | What to test, how to test it |
| Security Checklist | `.agent/skills/security-checklist.md` | Security review checklist for AI output |
| Prompt Master | `.agent/skills/prompt-master.md` | Refine and optimize prompts before execution |

## Commands
| Command | File | Description |
|---|---|---|
| `/review` | `.agent/commands/review.md` | Review current diff as a senior engineer |
| `/implement` | `.agent/commands/implement.md` | Implement a feature from spec |
| `/diagnose` | `.agent/commands/diagnose.md` | Diagnose a bug or error |
| `/refine` | `.agent/commands/refine.md` | Refine raw prompts before execution |

## Workflow: When to Use Which Agent

```
New Feature / Task
  │
  ├── Raw / ambiguous prompt? → /refine
  │     └── Prompt Master refines → User approves → Route to execution
  │
  ├── Clear spec? → /implement
  │     └── Technical Designer plans → Task Executor implements
  │
  ├── Bug? → /diagnose
  │     └── Root cause found → Fix or /implement
  │
  ├── Product planning? → Product Owner
  │     └── User stories → Senior Engineer App/Platform
  │
  ├── UX/Design? → Product Research Designer
  │     └── Flow improvements → Senior Engineer App
  │
  ├── Architecture? → CTO Expert
  │     └── Decision → Senior Engineer App/Platform
  │
  └── Before commit → /review
        └── Issues found → Fix → /review again → commit
```

## Configuration Notes
- All sub-agents read CLAUDE.md for project context
- Agents operate independently with fresh context windows
- Shared memory via PROJECT_JOURNAL.md and TASKS.md
- Do NOT use `--dangerously-skip-permissions` in CI/CD pipelines

## Cline Integration
- Cline operates as the primary agent orchestration system
- Follows the same agent definitions and workflows
- Integrated prompt refinement using PROMPT framework
- Maintains consistency across all AI models
- Leverages MCP servers for tool operations
- See `docs/ai-team/cline-integration.md` for full details

## AI System Compatibility
- **Cline**: Full agent orchestration with integrated workflow
- **Cursor**: Planning and architecture (design branches)
- **Claude Code**: Implementation and testing (impl branches)
- All systems follow the same agent definitions and quality standards

## Role Coordination Matrix

| Scenario | Primary Role | Secondary Roles | Escalation Trigger |
|---|---|---|---|
| **New Feature** | Work Router → Product Owner → Technical Designer | Senior Engineer App/Platform | Cross-domain impact |
| **Bug Fix** | Work Router → Diagnostic Agent → Task Executor | Code Reviewer | Critical system issue |
| **Architecture** | Work Router → CTO Expert | Senior Engineer App/Platform | Strategic decision |
| **UX Improvement** | Work Router → Product Research Designer | Senior Engineer App | Flow complexity |
| **Backend Change** | Work Router → Senior Engineer Platform | Senior Engineer App | Schema impact |
| **Frontend Change** | Work Router → Senior Engineer App | Product Research Designer | UX implications |

## Escalation Protocol

### Step 1: Work Router
- Classifies incoming tasks
- Selects best primary role
- Provides routing preamble

### Step 2: Primary Role
- Handles task according to expertise
- Coordinates with secondary roles if needed
- Escalates to CTO Expert if blocked

### Step 3: CTO Expert (if needed)
- Resolves cross-domain conflicts
- Makes architecture decisions
- Provides strategic guidance

### Step 4: Implementation
- Task Executor builds features
- Code Reviewer ensures quality
- All roles update documentation