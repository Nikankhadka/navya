# Contributing to Navya

## Getting Started

1. Fork and clone the repository
2. Follow the [Local Setup Guide](docs/onboarding/local-setup.md) to get the app running
3. Create a feature branch from `develop`

## Branch Naming

```
<type>/<short-description>
```

| Type | Example |
|---|---|
| `feat` | `feat/water-logging-screen` |
| `fix` | `fix/auth-token-refresh` |
| `chore` | `chore/update-dependencies` |
| `docs` | `docs/local-setup-guide` |
| `refactor` | `refactor/supabase-client` |

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`

## Pull Request Checklist

Before submitting a PR, ensure:

- [ ] `npm run typecheck` passes with no errors
- [ ] `npm run ci:local` passes (typecheck + tests)
- [ ] No `console.log` statements left in code (use `logger` utility)
- [ ] No secrets, API keys, or tokens committed
- [ ] All user input validated with Zod
- [ ] Components are under 150 lines
- [ ] No `any` types used (use `unknown` + type guards)
- [ ] Error boundaries wrap async operations
- [ ] RLS policies exist for new database tables
- [ ] `src/types/database.ts` up to date if schema changed

## Local Development Workflow

```bash
# Start everything (Supabase + Expo)
npm run dev

# Reset database (migrations + seed + types)
npm run db:reset

# Stop Supabase
npm run db:stop
```

Note: The Supabase CLI manages Docker containers internally. Ensure Docker Desktop is running.

## Adding Migrations

1. Create a new migration file in `supabase/migrations/`:
   ```bash
   npx supabase migration add descriptive_name
   ```
2. Write your SQL (tables, policies, functions, indexes)
3. Run `npm run db:reset` to apply locally and regenerate types
4. Commit the migration file

## Regenerating TypeScript Types

Handled automatically by `npm run db:reset`. If you need to regenerate without resetting the database:

```bash
npx supabase gen types typescript --local > src/types/database.ts
```

Do not edit `src/types/database.ts` manually.

## Code Review Process

1. Open a PR against `develop`
2. Fill in the PR template with:
   - What changed and why
   - Screenshots for UI changes
   - Testing steps
3. At least one review approval required before merge
4. Squash merge to keep history clean

## Code Standards

See [AGENTS.md](AGENTS.md) for full coding standards, including:

- No `any` types
- Functional components with named exports
- One component/hook/util per file
- Barrel exports (`index.ts`) for feature directories
- Zod validation for all user input
- Typed error handling, never silent catch
- Components under 150 lines

## Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Full CI check locally
npm run ci:local
```

Mock Supabase at the module level. Use Jest mocks for Zustand stores.

## Security

- Never commit `.env` files with real credentials
- Run `gitleaks detect --source . --verbose` before pushing
- All database access must go through RLS policies
- No service-role key calls from client code
- Review new npm packages before adding (last publish < 1 year, downloads > 1K)
