-- Meal Templates — reusable meals for fast logging
-- Supports both user-created and system-preset templates

create table if not exists public.meal_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  meal_time text not null check (meal_time in ('breakfast', 'lunch', 'dinner', 'snack')),
  foods jsonb not null default '[]'::jsonb,
  is_system boolean not null default false,
  is_favorite boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Each food entry in the foods jsonb array:
-- { "meal_name": "Eggs", "calories": 140, "protein_g": 12, "carbs_g": 1, "fat_g": 10 }

alter table public.meal_templates enable row level security;

drop policy if exists "Users can access own meal templates" on public.meal_templates;
create policy "Users can access own meal templates"
on public.meal_templates
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Authenticated users can read system templates" on public.meal_templates;
create policy "Authenticated users can read system templates"
on public.meal_templates
for select
using (is_system = true AND auth.role() = 'authenticated');

-- Index for fast user template lookup
create index if not exists idx_meal_templates_user_id
on public.meal_templates(user_id, meal_time);

-- Seed system-preset meal templates for AU/NP markets
insert into public.meal_templates (user_id, name, meal_time, foods, is_system, is_favorite)
select
  auth.uid(),
  name,
  meal_time,
  foods,
  true,
  false
from (
  values
    (
      '00000000-0000-0000-0000-000000000000',
      'Classic Eggs on Toast',
      'breakfast'::text,
      '[
        {"meal_name": "Scrambled Eggs (2 large)", "calories": 182, "protein_g": 12, "carbs_g": 2, "fat_g": 14},
        {"meal_name": "Wholegrain Toast (2 slices)", "calories": 176, "protein_g": 6, "carbs_g": 32, "fat_g": 3},
        {"meal_name": "Butter (10g)", "calories": 72, "protein_g": 0, "carbs_g": 0, "fat_g": 8}
      ]'::jsonb
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      'Muesli with Yogurt',
      'breakfast'::text,
      '[
        {"meal_name": "Muesli (60g)", "calories": 228, "protein_g": 6, "carbs_g": 40, "fat_g": 6},
        {"meal_name": "Greek Yogurt (150g)", "calories": 150, "protein_g": 15, "carbs_g": 6, "fat_g": 8},
        {"meal_name": "Banana (1 medium)", "calories": 105, "protein_g": 1, "carbs_g": 27, "fat_g": 0}
      ]'::jsonb
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      'Chicken Salad Wrap',
      'lunch'::text,
      '[
        {"meal_name": "Grilled Chicken Breast (150g)", "calories": 248, "protein_g": 46, "carbs_g": 0, "fat_g": 5},
        {"meal_name": "Wholemeal Wrap (1)", "calories": 170, "protein_g": 6, "carbs_g": 30, "fat_g": 4},
        {"meal_name": "Mixed Salad Leaves (50g)", "calories": 12, "protein_g": 1, "carbs_g": 2, "fat_g": 0},
        {"meal_name": "Mayo Light (15g)", "calories": 40, "protein_g": 0, "carbs_g": 1, "fat_g": 4}
      ]'::jsonb
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      'Buddha Bowl',
      'lunch'::text,
      '[
        {"meal_name": "Quinoa Cooked (150g)", "calories": 180, "protein_g": 6, "carbs_g": 32, "fat_g": 3},
        {"meal_name": "Chickpeas (100g)", "calories": 140, "protein_g": 7, "carbs_g": 23, "fat_g": 2},
        {"meal_name": "Avocado (half)", "calories": 160, "protein_g": 2, "carbs_g": 8, "fat_g": 15},
        {"meal_name": "Tahini Dressing (15ml)", "calories": 89, "protein_g": 2, "carbs_g": 3, "fat_g": 8}
      ]'::jsonb
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      'Grilled Fish with Veg',
      'dinner'::text,
      '[
        {"meal_name": "Barramundi Fillet (150g)", "calories": 195, "protein_g": 38, "carbs_g": 0, "fat_g": 4},
        {"meal_name": "Steamed Broccoli (100g)", "calories": 35, "protein_g": 3, "carbs_g": 7, "fat_g": 0},
        {"meal_name": "Sweet Potato Mash (150g)", "calories": 135, "protein_g": 2, "carbs_g": 31, "fat_g": 0},
        {"meal_name": "Olive Oil (10ml)", "calories": 88, "protein_g": 0, "carbs_g": 0, "fat_g": 10}
      ]'::jsonb
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      'Dal Bhat (Nepali Set)',
      'dinner'::text,
      '[
        {"meal_name": "Steamed Rice (200g)", "calories": 260, "protein_g": 5, "carbs_g": 58, "fat_g": 1},
        {"meal_name": "Dal (Lentil Soup, 250ml)", "calories": 180, "protein_g": 12, "carbs_g": 30, "fat_g": 3},
        {"meal_name": "Mixed Vegetable Curry (150g)", "calories": 120, "protein_g": 4, "carbs_g": 15, "fat_g": 5},
        {"meal_name": "Pickle/Achar (20g)", "calories": 30, "protein_g": 1, "carbs_g": 5, "fat_g": 1}
      ]'::jsonb
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      'Protein Smoothie',
      'snack'::text,
      '[
        {"meal_name": "Protein Powder (1 scoop)", "calories": 120, "protein_g": 24, "carbs_g": 3, "fat_g": 1},
        {"meal_name": "Banana (1 medium)", "calories": 105, "protein_g": 1, "carbs_g": 27, "fat_g": 0},
        {"meal_name": "Almond Milk (250ml)", "calories": 60, "protein_g": 2, "carbs_g": 8, "fat_g": 3}
      ]'::jsonb
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      'Trail Mix',
      'snack'::text,
      '[
        {"meal_name": "Mixed Nuts (30g)", "calories": 180, "protein_g": 6, "carbs_g": 5, "fat_g": 16},
        {"meal_name": "Dried Cranberries (20g)", "calories": 70, "protein_g": 0, "carbs_g": 17, "fat_g": 0}
      ]'::jsonb
    )
) as t(user_id, name, meal_time, foods)
where not exists (select 1 from public.meal_templates where is_system = true limit 1);

-- Add water_target_ml to user_profiles if not already present
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'water_target_ml'
  ) then
    alter table public.user_profiles
    add column water_target_ml integer not null default 2500;
  end if;
end $$;

-- Add goal_weight to user_profiles if not already present
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'goal_weight'
  ) then
    alter table public.user_profiles
    add column goal_weight numeric;
  end if;
end $$;
