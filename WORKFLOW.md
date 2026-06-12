# WORKFLOW.md — Navya Daily Development Guide (ECC Edition)

> Quick reference for efficient opencode + ECC development. Read when starting a session.

---

## Core Workflow

```
NEW FEATURE     → /plan → iterate → approve → /tdd → /code-review
BUG FIX         → /plan → /tdd → /code-review
REFACTOR        → /plan → /refactor-clean → /code-review
CODE CHANGE     → (edit) → /code-review
BEFORE COMMIT   → /security → /test-coverage → git commit
BUILD FAILURE   → /build-fix
DOCS UPDATE     → /update-docs
```

---

## Commands Quick Reference

### Plan & Build

| Command | What it does | Agent |
|---|---|---|
| `/plan "feature"` | Creates implementation plan. **No code until you approve.** | planner |
| `/tdd "feature"` | Red → Green → Refactor cycle. Tests first. 80%+ coverage. | tdd-guide |
| `/orchestrate "complex task"` | Chains planner → executor → reviewer → tester | planner |

### Review & Quality

| Command | What it does | Agent |
|---|---|---|
| `/code-review` | Reviews current git diff. Security, quality, best practices. | code-reviewer |
| `/security` | Deep security audit: secrets, XSS, SQLi, auth, validation | security-reviewer |
| `/security-scan` | Codebase-wide vulnerability scan | security-reviewer |
| `/build-fix` | Fixes TypeScript/build errors with minimal diffs | build-error-resolver |
| `/quality-gate` | Runs quality gates on specified scope | - |

### Testing

| Command | What it does | Agent |
|---|---|---|
| `/e2e "flow"` | Generates and runs Playwright E2E tests | e2e-runner |
| `/test-coverage` | Analyzes coverage gaps, suggests new tests | tdd-guide |
| `/verify` | Runs verification loop (tests + typecheck + lint) | - |

### Documentation & Learning

| Command | What it does | Agent |
|---|---|---|
| `/update-docs` | Updates documentation files | doc-updater |
| `/update-codemaps` | Updates code structure maps | doc-updater |
| `/learn` | Extracts patterns from current session | - |
| `/skill-create` | Generates skill files from git history | - |

### Session Management

| Command | What it does |
|---|---|
| `/checkpoint "description"` | Save current state for later recovery |
| `/eval "criteria"` | Evaluate work against specific criteria |
| `/setup-pm` | Configure package manager for project (runs `npm install`) |

### Advanced (Agent Loops & Harness)

| Command | What it does |
|---|---|
| `/loop-start "goal"` | Start autonomous agent loop for complex multi-step tasks |
| `/loop-status` | Check loop progress and checkpoints |
| `/model-route` | Choose optimal model for a task based on budget/complexity |
| `/harness-audit` | Audit ECC harness health and reliability |

### Instinct System (Learning)

| Command | What it does |
|---|---|
| `/instinct-status` | View learned patterns from sessions |
| `/instinct-import` | Import instincts from another project |
| `/instinct-export` | Export current project instincts |
| `/evolve` | Cluster instincts into new skills |
| `/promote` | Promote project instincts to global |
| `/projects` | List known projects and patterns |

---

## Plugin Hooks (Automatic)

These run without you doing anything. Configure via environment variables.

| Hook | Trigger | Action |
|---|---|---|
| **Prettier** | File edited (.ts/.tsx/.js/.jsx) | Auto-formats file |
| **console.log check** | File edited | Warns if console.log found |
| **TypeScript check** | File edited (.ts/.tsx) | Runs `tsc --noEmit` |
| **Security pre-check** | Before bash execution | Warns about dangerous commands |
| **PR reminder** | Before `git push` | Reminds to review diff |
| **File watcher** | File system changes | Tracks edited files |
| **Session idle** | Task complete | Console.log audit + desktop notification |
| **Shell env** | Bash execution | Injects PROJECT_ROOT, PACKAGE_MANAGER, etc. |
| **Compaction** | Context compaction | Preserves ECC context across compressions |

### Controlling Hooks

```bash
# Set hook profile
export ECC_HOOK_PROFILE=standard   # minimal | standard | strict

# Disable specific hooks
export ECC_DISABLED_HOOKS="post:edit:format,pre:bash:git-push-reminder"
```

---

## Best Practices

### 1. Always Plan First
For anything non-trivial, use `/plan "description"`. The planner **cannot write code** — it forces you to think through the design before implementation starts.

### 2. Review After Every Change
After any significant edit, run `/code-review`. The reviewer **cannot edit files** — it only analyzes. Critical/High issues block commit.

### 3. Test-First for New Code
Use `/tdd "feature"` for new features. The TDD guide enforces:
- Write tests → see them fail → implement → pass → refactor → verify coverage

### 4. Security Before Commit
Run `/security` before pushing. The security reviewer can fix issues it finds. Also run `gitleaks detect --source . --verbose`.

### 5. Build Fixes Are Atomic
When build fails, use `/build-fix`. It fixes only the error with minimal diffs — no tangential changes.

### 6. TypeCheck After Every Task
```bash
npm run typecheck    # Navya project typecheck
```
Plugin hook also auto-runs `tsc --noEmit` after each edit in strict mode.

### 7. Choose Your Model
All agents inherit your current model (set via `/models` or `opencode.jsonc`).
Switch models per task:
- `/models` → pick any available model for current session
- `/model-route` → route specific task to optimal model
- For planning/security/review tasks, consider switching to a stronger reasoning model first

---

## Agent Overview

| Agent | Role | Can Write? |
|---|---|---|
| **build** | Primary coder | Yes |
| **planner** | Implementation planning | No |
| **architect** | System design | No |
| **code-reviewer** | Code quality review | No |
| **security-reviewer** | Security audit | Yes (fixes) |
| **tdd-guide** | Test-driven dev | Yes |
| **build-error-resolver** | Fix build errors | Yes |
| **e2e-runner** | E2E testing | Yes |
| **refactor-cleaner** | Dead code cleanup | Yes |
| **doc-updater** | Documentation | Yes |
| **database-reviewer** | Supabase/SQL review | Yes |
| **python-reviewer** | Python code review | No |
| **docs-lookup** | API docs lookup | No |
| **harness-optimizer** | Harness tuning | Yes |
| **loop-operator** | Agent loop control | Yes |

---

## Project-Specific Commands

```bash
npm start                # Expo dev server
npm run typecheck        # TypeScript check
npm run verify           # Project verification (-- --smoke-web for web)
npm run ci:local         # Full CI (lint + types + tests)
npm run seed:tester      # Seed tester data
```

---

## Example Sessions

### New Feature: "Add water tracking to daily diary"

```
/plan "Add water tracking form to daily diary screen with Supabase persistence"

[Planner analyzes codebase, proposes design, waits for approval]

yes

/tdd "Water tracking: form component, validation, Supabase insert, display"

/TDD guide writes tests, implements, refactors, verifies coverage

/code-review

[Reviewer checks git diff, reports issues]

npm run typecheck
git commit -m "feat: add water tracking to daily diary"
```

### Bug Fix: "Login screen crashes on empty email"

```
/plan "Login crash: null email causes TypeError in validation hook"

[Planner identifies root cause, proposes fix]

yes

/code-review   [review the fix]

npm run typecheck
npm run ci:local
```

### Security Check Before Release

```
/security
/security-scan
/eval "Ready for production release?"
/quality-gate
```

---

## Quick Troubleshooting

| Problem | Solution |
|---|---|
| Plugin hooks not working | `cd ~/.config/opencode && npm install --legacy-peer-deps && npx tsc` |
| Agent command not found | Check `~/.config/opencode/opencode.jsonc` — verify agent is defined |
| TypeScript errors after edit | Run `/build-fix` or `npm run typecheck` |
| Context window full | Session auto-compacts; ECC compaction hook preserves task state |
| Disable ECC globally | `rm -rf ~/.config/opencode/{commands,prompts,plugins,tools,instructions,skills,dist,index.ts,package.json,tsconfig.json}` and restore your original `opencode.jsonc` |
