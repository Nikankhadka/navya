# Global Guardrails

## Product

- Use `Navya` as the only active product name.
- Keep active scope inside the fitness MVP.
- Treat web as secondary support, not the primary quality target.

## Architecture

- Keep screen components presentation-only.
- Put fetch logic in hooks.
- Put backend access in services.
- Keep stores limited to transient client state.
- Treat the database as the source of truth.

## Delivery

- `npm` only
- one lockfile: `package-lock.json`
- no new infrastructure without clear justification
- no secrets in the client
- no direct AI provider calls from the client

## Documentation

- Record the current phase and current step in `docs/execution/current-status.md`.
- Document meaningful architecture decisions in `docs/adr/`.
- Keep docs aligned with the codebase and update them in the same task when possible.
