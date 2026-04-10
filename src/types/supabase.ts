export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      ai_usage_logs: {
        Row: {
          action_count: number;
          action_date: string;
          id: string;
          tokens_used: number;
          user_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ai_usage_logs"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["ai_usage_logs"]["Row"]>;
      };
      coach_messages: {
        Row: {
          action_type: string;
          created_at: string;
          id: string;
          role: "coach" | "user";
          text: string;
          user_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["coach_messages"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["coach_messages"]["Row"]>;
      };
      exercise_library: {
        Row: {
          difficulty: string;
          equipment_required: string[] | null;
          id: string;
          instructions: string | null;
          muscle_groups: string[] | null;
          name: string;
          video_url: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["exercise_library"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["exercise_library"]["Row"]>;
      };
      feature_flags: {
        Row: {
          ai_enabled: boolean;
          food_search_enabled: boolean;
          notifications_enabled: boolean;
          weekly_summary_enabled: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["feature_flags"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["feature_flags"]["Row"]>;
      };
      food_logs: {
        Row: {
          calories: number;
          carbs_g: number | null;
          fat_g: number | null;
          id: string;
          logged_at: string;
          meal_name: string;
          meal_time: "breakfast" | "lunch" | "dinner" | "snack";
          notes: string | null;
          protein_g: number | null;
          user_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["food_logs"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["food_logs"]["Row"]>;
      };
      plan_exercises: {
        Row: {
          exercise_id: string;
          id: string;
          notes: string | null;
          order_index: number;
          plan_day_id: string;
          reps: string;
          rest_seconds: number;
          sets: number;
        };
        Insert: Partial<Database["public"]["Tables"]["plan_exercises"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["plan_exercises"]["Row"]>;
      };
      push_tokens: {
        Row: {
          created_at: string;
          device_type: string;
          id: string;
          token: string;
          user_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["push_tokens"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["push_tokens"]["Row"]>;
      };
      session_exercises: {
        Row: {
          completed_sets: Json | null;
          exercise_id: string;
          exercise_name: string;
          id: string;
          is_skipped: boolean;
          notes: string | null;
          planned_reps: string;
          planned_sets: number;
          session_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["session_exercises"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["session_exercises"]["Row"]>;
      };
      user_profiles: {
        Row: {
          activity_level: string | null;
          age_range: string | null;
          avatar_url: string | null;
          country: string | null;
          created_at: string | null;
          diet_preference: string | null;
          equipment: string[] | null;
          experience_level: string | null;
          full_name: string | null;
          gender: string | null;
          glow_focus: string | null;
          goal: string | null;
          height_cm: number | null;
          id: string;
          onboarding_complete: boolean | null;
          updated_at: string | null;
          weight_kg: number | null;
          workouts_per_week: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["user_profiles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Row"]>;
      };
      workout_plan_days: {
        Row: {
          day_name: string;
          day_of_week: string;
          estimated_minutes: number;
          id: string;
          order_index: number;
          plan_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["workout_plan_days"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["workout_plan_days"]["Row"]>;
      };
      workout_plans: {
        Row: {
          created_at: string;
          goal: string;
          id: string;
          is_active: boolean;
          name: string;
          user_id: string;
          version: number;
        };
        Insert: Partial<Database["public"]["Tables"]["workout_plans"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["workout_plans"]["Row"]>;
      };
      workout_sessions: {
        Row: {
          completed_at: string | null;
          day_name: string;
          duration_seconds: number | null;
          id: string;
          plan_day_id: string | null;
          started_at: string;
          status: string;
          user_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["workout_sessions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["workout_sessions"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
