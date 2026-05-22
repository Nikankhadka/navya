# Architecture Documentation — Navya

## Overview

This directory contains architecture documentation for the Navya application. Architecture decisions, data models, domain boundaries, and system design are recorded here.

## Documents

| Document | Description | Status |
|---|---|---|
| [System Overview](system-overview.md) | High-level system architecture and component relationships | 📝 Planned |
| [Data Model](data-model.md) | Core database schema, tables, and relationships | 📝 Planned |
| [Domain Boundaries](domain-boundaries.md) | Feature domains and their responsibilities | 📝 Planned |
| [State Management](state-management.md) | Client state (Zustand) vs server state (TanStack Query) separation | 📝 Planned |
| [Auth & Security](auth-and-security.md) | Authentication flow, RLS, session handling | 📝 Planned |
| [UI Stack](ui-stack.md) | Tamagui, NativeWind, theme system decisions | 📝 Planned |
| [Release & Environments](release-and-environments.md) | EAS builds, Vercel deployment, env config | 📝 Planned |
| [AI & Feature Flags](ai-and-feature-flags.md) | AI integration architecture, Edge Functions, flag strategy | 📝 Planned |

## Architecture Principles

1. **Feature-first folder structure** — code organized by domain, not by type
2. **Domain separation** — screens present, hooks fetch, services talk to Supabase, stores hold transient client state
3. **No direct AI from client** — all AI logic through Supabase Edge Functions
4. **Supabase as sole backend** — no custom server, no additional backend services
5. **Mobile-first** — iOS primary, Android primary, web secondary

## ADRs

Architecture Decision Records (ADRs) are stored in `docs/adr/` and follow the standard format:
- **Title:** Concise decision statement
- **Status:** Proposed | Accepted | Deprecated | Superseded
- **Context:** Why this decision was needed
- **Decision:** What was decided
- **Consequences:** Trade-offs, risks, follow-ups