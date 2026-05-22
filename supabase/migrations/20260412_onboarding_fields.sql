-- Rename profiles to user_profiles
alter table if exists profiles rename to user_profiles;

-- Add onboarding and glow focus columns
alter table user_profiles 
add column if not exists age_range text check (age_range in ('18-24', '25-34', '35-44', '45-54', '55+')),
add column if not exists gender text check (gender in ('male', 'female', 'non_binary', 'prefer_not_to_say')),
add column if not exists weight_kg numeric,
add column if not exists height_cm numeric,
add column if not exists goal text,
add column if not exists activity_level text,
add column if not exists experience_level text,
add column if not exists diet_preference text,
add column if not exists equipment text[],
add column if not exists workouts_per_week integer,
add column if not exists country text check (country in ('AU', 'NP', 'other')),
add column if not exists onboarding_complete boolean default false,
add column if not exists glow_focus text check (glow_focus in ('Skin', 'Hair', 'Body', 'Mind'));

-- Update trigger function to use new table name and first_name/last_name if they were renamed or logic changed
-- For now, keep it simple as onboarding will fill these. 
-- The existing handle_new_user uses public.profiles, so we update it.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, full_name, avatar_url)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', (new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name')),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;
