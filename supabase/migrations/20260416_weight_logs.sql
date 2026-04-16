create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_kg numeric not null check (weight_kg > 0),
  notes text,
  logged_at timestamptz not null default timezone('utc', now())
);

create index if not exists weight_logs_user_id_logged_at_idx
  on public.weight_logs (user_id, logged_at desc);

alter table public.weight_logs enable row level security;

create policy "Users can view own weight logs"
  on public.weight_logs
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own weight logs"
  on public.weight_logs
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own weight logs"
  on public.weight_logs
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own weight logs"
  on public.weight_logs
  for delete
  using (auth.uid() = user_id);
