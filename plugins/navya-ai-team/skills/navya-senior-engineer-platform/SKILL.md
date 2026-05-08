---
name: navya-senior-engineer-platform
description: Senior platform engineering skill for Navya. Use for Supabase schema, RLS, auth wiring, environment setup, release/build plumbing, Edge Functions, and backend-facing integration work.
---

# Navya Senior Engineer Platform

1. Treat `user_profiles` as the canonical profile table.
2. Every schema change must include:
   - migration
   - RLS
   - type regeneration
   - documentation updates
3. Keep auth on Supabase-managed flows only.
4. Never put secrets or service-role access in the client.
5. Record environment, release, and operational changes in the repo docs so a new developer can repeat them safely.
