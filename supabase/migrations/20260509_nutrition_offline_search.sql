create table if not exists public.custom_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  calories integer not null,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  default_serving_label text not null default '1 serving',
  default_serving_grams numeric,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.favorite_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('manual', 'usda_foundation', 'usda_sr_legacy')),
  source_food_id text,
  custom_food_id uuid references public.custom_foods(id) on delete set null,
  food_name text not null,
  category text,
  calories integer not null,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  default_serving_label text,
  default_serving_grams numeric,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

alter table public.food_logs
  add column if not exists source text not null default 'manual',
  add column if not exists source_food_id text,
  add column if not exists custom_food_id uuid references public.custom_foods(id) on delete set null,
  add column if not exists quantity numeric not null default 1,
  add column if not exists serving_label text,
  add column if not exists serving_grams numeric,
  add column if not exists is_custom boolean not null default false,
  add column if not exists updated_at timestamptz not null default timezone('utc', now()),
  add column if not exists deleted_at timestamptz;

alter table public.food_logs
  alter column source set default 'manual',
  alter column quantity set default 1,
  alter column is_custom set default false,
  alter column updated_at set default timezone('utc', now());

update public.food_logs
set
  source = coalesce(source, 'manual'),
  quantity = coalesce(quantity, 1),
  is_custom = coalesce(is_custom, false),
  updated_at = coalesce(updated_at, logged_at, timezone('utc', now()))
where
  source is null
  or quantity is null
  or is_custom is null
  or updated_at is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'food_logs_source_check'
  ) then
    alter table public.food_logs
      add constraint food_logs_source_check
      check (source in ('manual', 'usda_foundation', 'usda_sr_legacy'));
  end if;
end $$;

create index if not exists idx_food_logs_user_updated_at
  on public.food_logs(user_id, updated_at desc);

create index if not exists idx_custom_foods_user_updated_at
  on public.custom_foods(user_id, updated_at desc);

create index if not exists idx_favorite_foods_user_updated_at
  on public.favorite_foods(user_id, updated_at desc);

alter table public.custom_foods enable row level security;
alter table public.favorite_foods enable row level security;

drop policy if exists "Users can access own custom foods" on public.custom_foods;
create policy "Users can access own custom foods"
on public.custom_foods
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can access own favorite foods" on public.favorite_foods;
create policy "Users can access own favorite foods"
on public.favorite_foods
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
