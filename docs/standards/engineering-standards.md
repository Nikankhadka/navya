# Engineering Standards — Navya

## Code Quality

### TypeScript
- **Strict mode** enabled in `tsconfig.json`
- No `any` types — use `unknown` and narrow with type guards
- No non-null assertions (`!`) — handle nulls explicitly
- All functions have explicit return types
- Use Zod for runtime validation of external data

### Components
- Functional components only
- Named exports only (default exports only for Expo Router screens)
- Props interface defined above component, exported
- Components under 150 lines — extract hooks and sub-components

### Error Handling
- Every async operation: try/catch with typed errors
- Error boundaries at route/screen level
- User-facing errors are actionable, not cryptic
- Log errors to console only in development (strip in production)

## Testing Standards

See [.agent/rules/testing.mdc](/.agent/rules/testing.mdc) for the full testing guide.

### TL;DR
- Unit test business logic in services and utils
- Integration test API calls with mocked Supabase
- Component test forms and interactive elements
- No snapshot tests
- 70% coverage on services/utils, 50% overall

## Git Hygiene

### Branch Strategy
```
main ──────────────────────────
     └─ feat/task-XXX (feature branches)
     └─ fix/issue-XXX (bug fixes)
     └─ docs/XXX (documentation)
```

### Commit Messages
```
<type>(<scope>): <short description>

Types: feat | fix | refactor | test | docs | chore
Example: feat(nutrition): add meal grouping by breakfast/lunch/dinner/snack
```

### Pre-Commit Checklist
- [ ] `npm run typecheck` passes
- [ ] Tests pass (when test suite exists)
- [ ] No `console.log` left behind
- [ ] No hardcoded secrets or local paths
- [ ] Diff reviewed (not the whole file)
- [ ] Commit message follows format

## Pull Request Standards

### PR Size
- One task = one PR (unless tasks are tightly coupled)
- Max 400 lines changed per PR
- Larger changes must be broken into multiple PRs

### Review Requirements
- Every PR gets an AI auto-review (using `/review` command)
- CRITICAL and MAJOR issues must be addressed before merge
- Human review focuses on architecture and product logic
- AI review does not block merge — it informs human review

## Documentation Standards

### What to Document
- New features: add to relevant docs (architecture, onboarding, or execution)
- Architecture decisions: create an ADR in `docs/adr/`
- API changes: update API contracts
- Schema changes: update migration docs and type definitions

### What NOT to Document
- Implementation details that change frequently
- Code comments that restate the obvious
- Internal function signatures (code is self-documenting here)