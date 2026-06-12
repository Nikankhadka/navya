/**
 * Pre-built workout split templates.
 * Each template defines a complete workout plan with days, exercises, sets, reps.
 */

export interface SplitTemplate {
  id: string;
  name: string;
  description: string;
  daysPerWeek: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  muscleCoverage: string[];
  icon: string;
  days: SplitTemplateDay[];
}

export interface SplitTemplateDay {
  dayName: string;
  dayOfWeek: string;
  focusAreas: string[];
  exercises: SplitTemplateExercise[];
}

export interface SplitTemplateExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
}

export const SPLIT_TEMPLATES: SplitTemplate[] = [
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    description:
      'Rotating 6-day split — each muscle group hit 2× per week. Great for intermediate lifters.',
    daysPerWeek: 6,
    difficulty: 'intermediate',
    muscleCoverage: ['chest', 'shoulders', 'triceps', 'back', 'biceps', 'legs'],
    icon: '🔄',
    days: [
      {
        dayName: 'Push A',
        dayOfWeek: 'monday',
        focusAreas: ['chest', 'shoulders', 'triceps'],
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '6-10', restSeconds: 90 },
          { name: 'Overhead Press', sets: 3, reps: '8-12', restSeconds: 90 },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restSeconds: 75 },
          { name: 'Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60 },
          { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', restSeconds: 60 },
        ],
      },
      {
        dayName: 'Pull A',
        dayOfWeek: 'tuesday',
        focusAreas: ['back', 'biceps'],
        exercises: [
          { name: 'Deadlift', sets: 3, reps: '5', restSeconds: 120 },
          { name: 'Barbell Row', sets: 4, reps: '8-12', restSeconds: 90 },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', restSeconds: 60 },
          { name: 'Face Pull', sets: 3, reps: '15-20', restSeconds: 60 },
          { name: 'Barbell Curl', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayName: 'Legs A',
        dayOfWeek: 'wednesday',
        focusAreas: ['legs', 'glutes', 'calves'],
        exercises: [
          { name: 'Barbell Squat', sets: 4, reps: '6-10', restSeconds: 120 },
          { name: 'Romanian Deadlift', sets: 3, reps: '8-12', restSeconds: 90 },
          { name: 'Leg Press', sets: 3, reps: '10-12', restSeconds: 90 },
          { name: 'Calf Raise', sets: 4, reps: '15-20', restSeconds: 60 },
        ],
      },
      {
        dayName: 'Push B',
        dayOfWeek: 'thursday',
        focusAreas: ['chest', 'shoulders', 'triceps'],
        exercises: [
          { name: 'Overhead Press', sets: 4, reps: '6-10', restSeconds: 90 },
          { name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', restSeconds: 75 },
          { name: 'Cable Flyes', sets: 3, reps: '12-15', restSeconds: 60 },
          { name: 'Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60 },
          { name: 'Skull Crushers', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayName: 'Pull B',
        dayOfWeek: 'friday',
        focusAreas: ['back', 'biceps'],
        exercises: [
          { name: 'Barbell Row', sets: 4, reps: '8-12', restSeconds: 90 },
          { name: 'Pull Ups', sets: 3, reps: '8-12', restSeconds: 90 },
          { name: 'Seated Cable Row', sets: 3, reps: '10-12', restSeconds: 60 },
          { name: 'Hammer Curl', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayName: 'Legs B',
        dayOfWeek: 'saturday',
        focusAreas: ['legs', 'glutes'],
        exercises: [
          { name: 'Barbell Squat', sets: 4, reps: '6-10', restSeconds: 120 },
          { name: 'Leg Curl', sets: 3, reps: '12-15', restSeconds: 60 },
          { name: 'Leg Extension', sets: 3, reps: '12-15', restSeconds: 60 },
          { name: 'Calf Raise', sets: 4, reps: '15-20', restSeconds: 60 },
        ],
      },
    ],
  },
  {
    id: 'upper_lower',
    name: 'Upper / Lower Split',
    description: 'Efficient 4-day split. Upper body twice, lower body twice per week.',
    daysPerWeek: 4,
    difficulty: 'beginner',
    muscleCoverage: ['chest', 'back', 'shoulders', 'arms', 'legs'],
    icon: '⬆️⬇️',
    days: [
      {
        dayName: 'Upper A',
        dayOfWeek: 'monday',
        focusAreas: ['chest', 'back', 'shoulders'],
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '6-10', restSeconds: 90 },
          { name: 'Barbell Row', sets: 4, reps: '8-12', restSeconds: 90 },
          { name: 'Overhead Press', sets: 3, reps: '8-12', restSeconds: 75 },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', restSeconds: 60 },
          { name: 'Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60 },
        ],
      },
      {
        dayName: 'Lower A',
        dayOfWeek: 'tuesday',
        focusAreas: ['legs', 'glutes'],
        exercises: [
          { name: 'Barbell Squat', sets: 4, reps: '6-10', restSeconds: 120 },
          { name: 'Romanian Deadlift', sets: 3, reps: '8-12', restSeconds: 90 },
          { name: 'Leg Press', sets: 3, reps: '10-12', restSeconds: 90 },
          { name: 'Calf Raise', sets: 3, reps: '15-20', restSeconds: 60 },
        ],
      },
      {
        dayName: 'Upper B',
        dayOfWeek: 'thursday',
        focusAreas: ['chest', 'back', 'arms'],
        exercises: [
          { name: 'Incline Dumbbell Press', sets: 4, reps: '8-12', restSeconds: 75 },
          { name: 'Seated Cable Row', sets: 4, reps: '10-12', restSeconds: 60 },
          { name: 'Overhead Press', sets: 3, reps: '8-12', restSeconds: 75 },
          { name: 'Barbell Curl', sets: 3, reps: '10-12', restSeconds: 60 },
          { name: 'Tricep Pushdowns', sets: 3, reps: '12-15', restSeconds: 60 },
        ],
      },
      {
        dayName: 'Lower B',
        dayOfWeek: 'friday',
        focusAreas: ['legs', 'glutes'],
        exercises: [
          { name: 'Deadlift', sets: 3, reps: '5', restSeconds: 120 },
          { name: 'Leg Press', sets: 4, reps: '10-12', restSeconds: 90 },
          { name: 'Leg Curl', sets: 3, reps: '12-15', restSeconds: 60 },
          { name: 'Calf Raise', sets: 4, reps: '15-20', restSeconds: 60 },
        ],
      },
    ],
  },
  {
    id: 'full_body',
    name: 'Full Body',
    description: '3 days per week, every muscle group each session. Perfect for beginners.',
    daysPerWeek: 3,
    difficulty: 'beginner',
    muscleCoverage: ['chest', 'back', 'shoulders', 'legs', 'arms'],
    icon: '🏋️',
    days: [
      {
        dayName: 'Full Body A',
        dayOfWeek: 'monday',
        focusAreas: ['full_body'],
        exercises: [
          { name: 'Barbell Squat', sets: 3, reps: '8-12', restSeconds: 90 },
          { name: 'Barbell Bench Press', sets: 3, reps: '8-12', restSeconds: 90 },
          { name: 'Barbell Row', sets: 3, reps: '8-12', restSeconds: 90 },
          { name: 'Overhead Press', sets: 3, reps: '8-12', restSeconds: 75 },
          { name: 'Plank', sets: 3, reps: '30-60s', restSeconds: 60 },
        ],
      },
      {
        dayName: 'Full Body B',
        dayOfWeek: 'wednesday',
        focusAreas: ['full_body'],
        exercises: [
          { name: 'Deadlift', sets: 3, reps: '5-8', restSeconds: 120 },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restSeconds: 75 },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', restSeconds: 60 },
          { name: 'Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60 },
          { name: 'Leg Press', sets: 3, reps: '10-12', restSeconds: 90 },
        ],
      },
      {
        dayName: 'Full Body C',
        dayOfWeek: 'friday',
        focusAreas: ['full_body'],
        exercises: [
          { name: 'Barbell Squat', sets: 3, reps: '8-12', restSeconds: 90 },
          { name: 'Barbell Bench Press', sets: 3, reps: '8-12', restSeconds: 90 },
          { name: 'Barbell Row', sets: 3, reps: '8-12', restSeconds: 90 },
          { name: 'Romanian Deadlift', sets: 3, reps: '8-12', restSeconds: 90 },
          { name: 'Barbell Curl', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
    ],
  },
  {
    id: 'bro_split',
    name: 'Bro Split',
    description:
      'Classic bodybuilding — one muscle group per day, 5 days/week. Maximum volume per muscle.',
    daysPerWeek: 5,
    difficulty: 'intermediate',
    muscleCoverage: ['chest', 'back', 'shoulders', 'legs', 'arms'],
    icon: '💪',
    days: [
      {
        dayName: 'Chest Day',
        dayOfWeek: 'monday',
        focusAreas: ['chest'],
        exercises: [
          { name: 'Barbell Bench Press', sets: 4, reps: '8-12', restSeconds: 90 },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restSeconds: 75 },
          { name: 'Cable Flyes', sets: 3, reps: '12-15', restSeconds: 60 },
        ],
      },
      {
        dayName: 'Back Day',
        dayOfWeek: 'tuesday',
        focusAreas: ['back'],
        exercises: [
          { name: 'Deadlift', sets: 4, reps: '5-8', restSeconds: 120 },
          { name: 'Barbell Row', sets: 4, reps: '8-12', restSeconds: 90 },
          { name: 'Lat Pulldown', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
      {
        dayName: 'Shoulder Day',
        dayOfWeek: 'wednesday',
        focusAreas: ['shoulders'],
        exercises: [
          { name: 'Overhead Press', sets: 4, reps: '8-12', restSeconds: 90 },
          { name: 'Lateral Raise', sets: 4, reps: '12-15', restSeconds: 60 },
          { name: 'Face Pull', sets: 3, reps: '15-20', restSeconds: 60 },
        ],
      },
      {
        dayName: 'Leg Day',
        dayOfWeek: 'thursday',
        focusAreas: ['legs', 'glutes'],
        exercises: [
          { name: 'Barbell Squat', sets: 4, reps: '8-12', restSeconds: 120 },
          { name: 'Romanian Deadlift', sets: 3, reps: '10-12', restSeconds: 90 },
          { name: 'Leg Press', sets: 3, reps: '12-15', restSeconds: 90 },
          { name: 'Calf Raise', sets: 4, reps: '15-20', restSeconds: 60 },
        ],
      },
      {
        dayName: 'Arm Day',
        dayOfWeek: 'friday',
        focusAreas: ['biceps', 'triceps'],
        exercises: [
          { name: 'Barbell Curl', sets: 4, reps: '10-12', restSeconds: 60 },
          { name: 'Hammer Curl', sets: 3, reps: '10-12', restSeconds: 60 },
          { name: 'Tricep Pushdowns', sets: 4, reps: '12-15', restSeconds: 60 },
          { name: 'Skull Crushers', sets: 3, reps: '10-12', restSeconds: 60 },
        ],
      },
    ],
  },
];
