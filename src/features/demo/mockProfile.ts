import type { UserProfile, WeightLog } from '@/types/app';

export const MOCK_PROFILE: UserProfile = {
  id: 'mock-user-1',
  email: 'arjun@navya.app',
  full_name: 'Arjun Sharma',
  avatar_url: null,
  age_range: '25-34',
  gender: 'male',
  weight_kg: 78,
  goal_weight: 75,
  water_target_ml: 2500,
  height_cm: 178,
  goal: 'build_muscle',
  activity_level: 'moderately_active',
  experience_level: 'intermediate',
  diet_preference: 'high_protein',
  equipment: ['gym', 'dumbbells', 'barbell'],
  workouts_per_week: 5,
  country: 'AU',
  onboarding_complete: true,
  glow_focus: 'Body',
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-03-11T00:00:00Z',
};

export const MOCK_WEIGHT_LOGS: WeightLog[] = [
  {
    id: 'weight-1',
    user_id: 'mock-user-1',
    weight_kg: 80.1,
    logged_at: new Date(Date.now() - 14 * 24 * 3600_000).toISOString(),
  },
  {
    id: 'weight-2',
    user_id: 'mock-user-1',
    weight_kg: 79.6,
    logged_at: new Date(Date.now() - 7 * 24 * 3600_000).toISOString(),
  },
  {
    id: 'weight-3',
    user_id: 'mock-user-1',
    weight_kg: 79.1,
    logged_at: new Date(Date.now() - 24 * 3600_000).toISOString(),
  },
];
