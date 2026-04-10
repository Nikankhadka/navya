# Navya Tech Stack

This document serves as a quick technical summary for Navya. Canonical architecture and standards now live under `docs/architecture/` and `docs/standards/`.

## Core Stack

### Frontend
- **Framework:** Expo (React Native)
- **Navigation:** Expo Router (File-based routing)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS (via NativeWind v4+)
- **State Management:** Zustand (Client state), TanStack Query (Server state)
- **Platform:** iOS, Android (Primary), Web (Secondary)

### Backend
- **Platform:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Authentication:** Supabase Auth (Email OTP, Google, Apple)
- **Storage:** Supabase Storage (Media/Assets)
- **Database:** PostgreSQL (with RLS enabled)

### AI & Agents
- **Provider:** OpenAI (via Supabase Edge Functions)
- **Framework:** BMAD (v6.1.0) for agentic workflows
- **Constraints:** Max A$50/mo infra budget; AI logic must be through backend only.

## Development Environment
- **Package Manager:** npm (with `--legacy-peer-deps` for React 19 compatibility)
- **Tools:** Claude CLI, Supabase CLI
- **Linting/Types:** Strict TypeScript, ESLint (Standard Expo config)

