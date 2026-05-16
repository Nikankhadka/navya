# Role Boundary Matrix

How concerns are divided when multiple roles could claim ownership.

| Concern | Primary Owner | Supports / Coordinates | Notes |
|---------|-------------|----------------------|-------|
| **Schema design** | Platform | CTO (if cross-domain) | Platform owns the SQL; CTO owns the data model architecture |
| **RLS policies** | Platform | — | Always owned by Platform with the schema |
| **Auth — provider config** | Platform | — | Supabase console config, OAuth setup |
| **Auth — login screen** | App | — | UI for sign-in, sign-up, magic-link |
| **Auth — session handling** | App | Platform (for token contract) | Client-side token storage, callback handling |
| **Database types** | Platform | App (needs to consume them) | Platform generates `src/types/database.ts`; App uses them |
| **Frontend DTOs / mappers** | App | — | App transforms DB types into screen-ready shapes |
| **Edge Functions** | Platform | App (if function sends client data) | Platform owns deployment; App defines the client contract |
| **Navigation structure** | App | PO (for flow definition) | App implements; PO defines the flow |
| **Screen implementation** | App | PRD (for UX feedback) | App builds; PRD reviews |
| **Loading / empty / error states** | App | — | App owns all screen states |
| **Copy and tone** | PRD | App (implements copy) | PRD writes/edits; App drops it in |
| **Sprint sequencing** | PO | CTO (for risk assessment) | PO orders; CTO flags scope risk |
| **User stories / acceptance** | PO | — | PO authors; engineers validate feasibility |
| **MVP scope definition** | PO | CTO | PO defines product scope; CTO enforces technical boundaries |
| **Migration ordering** | Platform | PO (for dependency timing) | Platform owns migration chain; PO may need to sequence features |
| **Onboarding flow** | App | PRD + PO | App implements; PRD critiques; PO defines requirements |
| **Feature flags** | App | Platform (if env-specific) | Client-side flags owned by App; Platform sets env-level flags |
| **Deployment / env config** | Platform | — | EAS, Vercel, env vars |
## Overlap Resolution

When a concern claims two roles, follow this resolution order:

1. **Check this matrix** — if listed above, follow the assignment
2. **Check escalation triggers** in `coding-flow.md` — does this need CTO?
3. **Default to the role with the most context** — if the work is in an area where one role has been more active, let that role own it
4. **Escalate to CTO** if neither role clearly owns the concern