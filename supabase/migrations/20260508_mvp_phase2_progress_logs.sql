create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric not null,
  logged_at timestamptz not null default timezone('utc', now())
);

alter table public.weight_logs enable row level security;

drop policy if exists "Users can access own weight logs" on public.weight_logs;
create policy "Users can access own weight logs"
on public.weight_logs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
