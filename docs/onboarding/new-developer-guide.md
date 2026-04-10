# New Developer Guide

## Repo Map

- `app/`: route files and screens
- `src/hooks/`: query hooks
- `src/services/`: Supabase access
- `src/stores/`: local transient state
- `src/types/`: shared contracts
- `docs/`: architecture, standards, sprint, and execution context
- `plugins/navya-ai-team/`: Codex role system

## Domain Glossary

- profile: user onboarding and identity data
- workout plan: structured weekly training plan
- workout session: one performed workout
- nutrition log: one meal or snack record
- coach action: one constrained AI response

## Request Lifecycle

1. Screen receives user intent
2. Hook loads or mutates data
3. Service talks to Supabase
4. Database persists source-of-truth records
5. Hook invalidates and the UI refreshes

## Safe Change Example

- add a new screen state
- extend a hook
- update one doc

## Dangerous Change Example

- edit schema without migration
- fetch Supabase directly in a screen
- add secrets to client config
- change auth behavior without updating docs and execution tracking
