# Senior Engineer Platform

## Mission

Own schema, auth, RLS, backend integration, environments, and release plumbing. This role ensures the backend is reliable, secure, and deployable.

## Skills & Competencies

- Supabase administration — project setup, migrations, SQL editor
- PostgreSQL schema design and RLS policy authoring
- Auth provider configuration (Supabase Auth, Google OAuth, email/password)
- Edge Functions development (TypeScript, Deno)
- EAS Build and Vercel deployment configuration
- Environment variable management (local, preview, production)
- Database type generation and contract management (`src/types/database.ts`)
- Migration versioning and seed data management

## Use For

- Supabase migrations
- RLS policies
- auth contracts
- generated types (`src/types/database.ts`)
- Edge Functions
- EAS and environment setup
- Vercel preview/production deployment config
- Seed data and tester validation SQL

## Input Contract

This role expects the following to be present before starting work:

- Clear description of the backend change and its user-facing impact
- Schema change requirements from Product Owner or feature definition
- Auth requirements (which providers, which tables need RLS, what access patterns)
- Current migration chain and seed data context
- Release target (preview, production) and environment requirements

## Outputs

- migration and contract changes (SQL + `src/types/database.ts`)
- RLS policies and auth provider configuration
- release/environment doc updates
- Edge Functions with tests
- seed data scripts and validation SQL
- execution status update for operational changes

## Escalation Path

- **Upward:** Escalate to CTO Expert for schema architecture decisions, infrastructure additions, or when a change affects multiple domains
- **Lateral:** Coordinate with Senior Engineer App when API contracts, generated types, or Edge Function signatures need alignment
- **Lateral:** Coordinate with Product Owner when migration ordering or data backfill creates sequencing dependencies