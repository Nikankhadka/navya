export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
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
        Insert: {
          action_count?: number;
          action_date?: string;
          id?: string;
          tokens_used?: number;
          user_id: string;
        };
        Update: {
          action_count?: number;
          action_date?: string;
          id?: string;
          tokens_used?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      coach_messages: {
        Row: {
          action_type: string;
          created_at: string;
          id: string;
          role: string;
          text: string;
          user_id: string;
        };
        Insert: {
          action_type: string;
          created_at?: string;
          id?: string;
          role: string;
          text: string;
          user_id: string;
        };
        Update: {
          action_type?: string;
          created_at?: string;
          id?: string;
          role?: string;
          text?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      custom_foods: {
        Row: {
          calories: number;
          carbs_g: number | null;
          created_at: string;
          default_serving_grams: number | null;
          default_serving_label: string;
          deleted_at: string | null;
          fat_g: number | null;
          id: string;
          name: string;
          protein_g: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          calories: number;
          carbs_g?: number | null;
          created_at?: string;
          default_serving_grams?: number | null;
          default_serving_label?: string;
          deleted_at?: string | null;
          fat_g?: number | null;
          id?: string;
          name: string;
          protein_g?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          calories?: number;
          carbs_g?: number | null;
          created_at?: string;
          default_serving_grams?: number | null;
          default_serving_label?: string;
          deleted_at?: string | null;
          fat_g?: number | null;
          id?: string;
          name?: string;
          protein_g?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      exercise_library: {
        Row: {
          difficulty: string;
          equipment_required: string[];
          id: string;
          instructions: string | null;
          muscle_groups: string[];
          name: string;
          video_url: string | null;
        };
        Insert: {
          difficulty: string;
          equipment_required?: string[];
          id?: string;
          instructions?: string | null;
          muscle_groups?: string[];
          name: string;
          video_url?: string | null;
        };
        Update: {
          difficulty?: string;
          equipment_required?: string[];
          id?: string;
          instructions?: string | null;
          muscle_groups?: string[];
          name?: string;
          video_url?: string | null;
        };
        Relationships: [];
      };
      favorite_foods: {
        Row: {
          calories: number;
          carbs_g: number | null;
          category: string | null;
          created_at: string;
          custom_food_id: string | null;
          default_serving_grams: number | null;
          default_serving_label: string | null;
          deleted_at: string | null;
          fat_g: number | null;
          food_name: string;
          id: string;
          protein_g: number | null;
          source: string;
          source_food_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          calories: number;
          carbs_g?: number | null;
          category?: string | null;
          created_at?: string;
          custom_food_id?: string | null;
          default_serving_grams?: number | null;
          default_serving_label?: string | null;
          deleted_at?: string | null;
          fat_g?: number | null;
          food_name: string;
          id?: string;
          protein_g?: number | null;
          source: string;
          source_food_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          calories?: number;
          carbs_g?: number | null;
          category?: string | null;
          created_at?: string;
          custom_food_id?: string | null;
          default_serving_grams?: number | null;
          default_serving_label?: string | null;
          deleted_at?: string | null;
          fat_g?: number | null;
          food_name?: string;
          id?: string;
          protein_g?: number | null;
          source?: string;
          source_food_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'favorite_foods_custom_food_id_fkey';
            columns: ['custom_food_id'];
            isOneToOne: false;
            referencedRelation: 'custom_foods';
            referencedColumns: ['id'];
          },
        ];
      };
      feature_flags: {
        Row: {
          ai_enabled: boolean;
          food_search_enabled: boolean;
          id: string;
          notifications_enabled: boolean;
          weekly_summary_enabled: boolean;
        };
        Insert: {
          ai_enabled?: boolean;
          food_search_enabled?: boolean;
          id?: string;
          notifications_enabled?: boolean;
          weekly_summary_enabled?: boolean;
        };
        Update: {
          ai_enabled?: boolean;
          food_search_enabled?: boolean;
          id?: string;
          notifications_enabled?: boolean;
          weekly_summary_enabled?: boolean;
        };
        Relationships: [];
      };
      food_logs: {
        Row: {
          calories: number;
          carbs_g: number | null;
          custom_food_id: string | null;
          deleted_at: string | null;
          fat_g: number | null;
          id: string;
          is_custom: boolean;
          logged_at: string;
          meal_name: string;
          meal_time: string;
          notes: string | null;
          protein_g: number | null;
          quantity: number;
          serving_grams: number | null;
          serving_label: string | null;
          source: string;
          source_food_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          calories: number;
          carbs_g?: number | null;
          custom_food_id?: string | null;
          deleted_at?: string | null;
          fat_g?: number | null;
          id?: string;
          is_custom?: boolean;
          logged_at?: string;
          meal_name: string;
          meal_time: string;
          notes?: string | null;
          protein_g?: number | null;
          quantity?: number;
          serving_grams?: number | null;
          serving_label?: string | null;
          source?: string;
          source_food_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          calories?: number;
          carbs_g?: number | null;
          custom_food_id?: string | null;
          deleted_at?: string | null;
          fat_g?: number | null;
          id?: string;
          is_custom?: boolean;
          logged_at?: string;
          meal_name?: string;
          meal_time?: string;
          notes?: string | null;
          protein_g?: number | null;
          quantity?: number;
          serving_grams?: number | null;
          serving_label?: string | null;
          source?: string;
          source_food_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'food_logs_custom_food_id_fkey';
            columns: ['custom_food_id'];
            isOneToOne: false;
            referencedRelation: 'custom_foods';
            referencedColumns: ['id'];
          },
        ];
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
        Insert: {
          exercise_id: string;
          id?: string;
          notes?: string | null;
          order_index?: number;
          plan_day_id: string;
          reps: string;
          rest_seconds?: number;
          sets: number;
        };
        Update: {
          exercise_id?: string;
          id?: string;
          notes?: string | null;
          order_index?: number;
          plan_day_id?: string;
          reps?: string;
          rest_seconds?: number;
          sets?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'plan_exercises_exercise_id_fkey';
            columns: ['exercise_id'];
            isOneToOne: false;
            referencedRelation: 'exercise_library';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'plan_exercises_plan_day_id_fkey';
            columns: ['plan_day_id'];
            isOneToOne: false;
            referencedRelation: 'workout_plan_days';
            referencedColumns: ['id'];
          },
        ];
      };
      push_tokens: {
        Row: {
          created_at: string;
          device_type: string;
          id: string;
          token: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          device_type: string;
          id?: string;
          token: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          device_type?: string;
          id?: string;
          token?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      session_exercises: {
        Row: {
          completed_sets: Json;
          exercise_id: string | null;
          exercise_name: string;
          id: string;
          is_skipped: boolean;
          notes: string | null;
          planned_reps: string;
          planned_sets: number;
          session_id: string;
        };
        Insert: {
          completed_sets?: Json;
          exercise_id?: string | null;
          exercise_name: string;
          id?: string;
          is_skipped?: boolean;
          notes?: string | null;
          planned_reps: string;
          planned_sets: number;
          session_id: string;
        };
        Update: {
          completed_sets?: Json;
          exercise_id?: string | null;
          exercise_name?: string;
          id?: string;
          is_skipped?: boolean;
          notes?: string | null;
          planned_reps?: string;
          planned_sets?: number;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'session_exercises_exercise_id_fkey';
            columns: ['exercise_id'];
            isOneToOne: false;
            referencedRelation: 'exercise_library';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'session_exercises_session_id_fkey';
            columns: ['session_id'];
            isOneToOne: false;
            referencedRelation: 'workout_sessions';
            referencedColumns: ['id'];
          },
        ];
      };
      user_profiles: {
        Row: {
          activity_level: string | null;
          age_range: string | null;
          avatar_url: string | null;
          country: string | null;
          created_at: string;
          diet_preference: string | null;
          equipment: string[];
          experience_level: string | null;
          full_name: string | null;
          gender: string | null;
          glow_focus: string | null;
          goal: string | null;
          height_cm: number | null;
          id: string;
          onboarding_complete: boolean;
          updated_at: string;
          weight_kg: number | null;
          workouts_per_week: number;
        };
        Insert: {
          activity_level?: string | null;
          age_range?: string | null;
          avatar_url?: string | null;
          country?: string | null;
          created_at?: string;
          diet_preference?: string | null;
          equipment?: string[];
          experience_level?: string | null;
          full_name?: string | null;
          gender?: string | null;
          glow_focus?: string | null;
          goal?: string | null;
          height_cm?: number | null;
          id: string;
          onboarding_complete?: boolean;
          updated_at?: string;
          weight_kg?: number | null;
          workouts_per_week?: number;
        };
        Update: {
          activity_level?: string | null;
          age_range?: string | null;
          avatar_url?: string | null;
          country?: string | null;
          created_at?: string;
          diet_preference?: string | null;
          equipment?: string[];
          experience_level?: string | null;
          full_name?: string | null;
          gender?: string | null;
          glow_focus?: string | null;
          goal?: string | null;
          height_cm?: number | null;
          id?: string;
          onboarding_complete?: boolean;
          updated_at?: string;
          weight_kg?: number | null;
          workouts_per_week?: number;
        };
        Relationships: [];
      };
      water_logs: {
        Row: {
          amount_ml: number;
          id: string;
          logged_at: string;
          user_id: string;
        };
        Insert: {
          amount_ml: number;
          id?: string;
          logged_at?: string;
          user_id: string;
        };
        Update: {
          amount_ml?: number;
          id?: string;
          logged_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      weight_logs: {
        Row: {
          id: string;
          logged_at: string;
          user_id: string;
          weight_kg: number;
        };
        Insert: {
          id?: string;
          logged_at?: string;
          user_id: string;
          weight_kg: number;
        };
        Update: {
          id?: string;
          logged_at?: string;
          user_id?: string;
          weight_kg?: number;
        };
        Relationships: [];
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
        Insert: {
          day_name: string;
          day_of_week: string;
          estimated_minutes?: number;
          id?: string;
          order_index?: number;
          plan_id: string;
        };
        Update: {
          day_name?: string;
          day_of_week?: string;
          estimated_minutes?: number;
          id?: string;
          order_index?: number;
          plan_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workout_plan_days_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'workout_plans';
            referencedColumns: ['id'];
          },
        ];
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
        Insert: {
          created_at?: string;
          goal: string;
          id?: string;
          is_active?: boolean;
          name: string;
          user_id: string;
          version?: number;
        };
        Update: {
          created_at?: string;
          goal?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          user_id?: string;
          version?: number;
        };
        Relationships: [];
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
        Insert: {
          completed_at?: string | null;
          day_name: string;
          duration_seconds?: number | null;
          id?: string;
          plan_day_id?: string | null;
          started_at?: string;
          status?: string;
          user_id: string;
        };
        Update: {
          completed_at?: string | null;
          day_name?: string;
          duration_seconds?: number | null;
          id?: string;
          plan_day_id?: string | null;
          started_at?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workout_sessions_plan_day_id_fkey';
            columns: ['plan_day_id'];
            isOneToOne: false;
            referencedRelation: 'workout_plan_days';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
