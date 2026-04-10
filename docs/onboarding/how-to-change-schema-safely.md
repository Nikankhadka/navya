# How To Change Schema Safely

1. Add a migration in `supabase/migrations/`
2. Add or update RLS
3. Regenerate `src/types/supabase.ts`
4. Update the affected services and hooks
5. Update architecture docs if the contract changed
6. Update execution tracking
