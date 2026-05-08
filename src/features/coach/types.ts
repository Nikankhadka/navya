export type CoachActionType =
  | 'daily_insight'
  | 'create_plan'
  | 'adjust_workout'
  | 'nutrition_tip'
  | 'weekly_summary'
  | 'quick_reply';

export interface CoachMessage {
  id: string;
  user_id: string;
  action_type: CoachActionType;
  role: 'coach' | 'user';
  text: string;
  created_at: string;
}

export interface FeatureFlags {
  ai_enabled: boolean;
  food_search_enabled: boolean;
  notifications_enabled: boolean;
  weekly_summary_enabled: boolean;
}
