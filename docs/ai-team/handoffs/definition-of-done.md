# Definition Of Done

A substantial task is done when ALL of the following are satisfied:

## Implementation
- [ ] Implementation is complete — all acceptance criteria from the task/spec are met
- [ ] Feature works in both demo mode (if applicable) and live Supabase mode
- [ ] No TODO, FIXME, or debug comments left behind
- [ ] No dead code, commented-out blocks, or unused imports

## Quality Gates
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run lint` passes (when ESLint is configured)
- [ ] All new code follows the patterns in CLAUDE.md and `.agent/rules/`
- [ ] No `console.log` left behind (use the logger utility)

## Testing
- [ ] Tests are written for:
  - Happy path (correct input → correct output)
  - Error states (API failures, network timeouts)
  - Edge cases (null, empty, auth boundaries)
- [ ] `npm test` passes (when test suite exists)

## Documentation
- [ ] `TASKS.md` updated (task marked as done, notes added)
- [ ] `docs/execution/current-status.md` updated (what changed, what comes next)
- [ ] If the task adds a new feature: user story or feature doc updated
- [ ] If the task changes schema/migration: migration documented
- [ ] If the task changes architecture: ADR or architecture doc updated

## Review
- [ ] Diff reviewed (not the whole file — the diff)
- [ ] Edge cases manually checked: null, empty, zero, auth boundaries
- [ ] Error handling paths verified — no silent catches
- [ ] No hardcoded secrets, API keys, or local paths
- [ ] If browser testing is relevant: run with Playwright to verify the feature

## Merge
- [ ] Clean git history (rebased against target branch)
- [ ] Commit message follows format: `<type>(<scope>): <short description>`
- [ ] PR created with description of changes