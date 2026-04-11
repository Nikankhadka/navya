create table if not exists public.water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_ml integer not null check (amount_ml > 0),
  logged_at timestamptz not null default timezone('utc', now())
);

alter table public.water_logs enable row level security;

drop policy if exists "Users can access own water logs" on public.water_logs;
create policy "Users can access own water logs"
on public.water_logs
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
