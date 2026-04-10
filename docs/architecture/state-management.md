# State Management

## Zustands Stores

Use stores for:

- auth session shell state
- onboarding draft state
- in-session workout progress

Do not use stores for long-lived backend records when React Query can own them.

## React Query

Use hooks for:

- profile
- workout plan
- workout session history
- nutrition logs
- coach messages
- feature flags
