import { create } from 'zustand';
import type { UserProfile, GoalType, ActivityLevel, ExperienceLevel, DietPreference, EquipmentType } from '@/types/app';

interface OnboardingState extends Partial<UserProfile> {
  // Helpers
  setField: <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => void;
  reset: () => void;
  buildPayload: () => Partial<UserProfile>;
}

const initialState: Partial<UserProfile> = {
  full_name: '',
  age_range: '25-34',
  gender: 'female',
  country: 'AU',
  glow_focus: 'Body',
  goal: 'general_fitness',
  activity_level: 'moderately_active',
  experience_level: 'beginner',
  diet_preference: 'no_preference',
  equipment: [],
  workouts_per_week: 3,
  weight_kg: null,
  height_cm: null,
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialState,

  setField: (field, value) => {
    set({ [field]: value });
  },

  reset: () => set(initialState),

  buildPayload: () => {
    const state = get();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { setField, reset, buildPayload, ...payload } = state;
    return payload;
  },
}));
