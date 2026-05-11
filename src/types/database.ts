// Hand-written types mirroring 0001_init.sql.
// Replace by running: supabase gen types typescript --project-id <ID> > src/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          bodyweight_kg: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          bodyweight_kg?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          bodyweight_kg?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      muscle_groups: {
        Row: { id: number; name: string };
        Insert: { id: number; name: string };
        Update: { id?: number; name?: string };
        Relationships: [];
      };
      exercises: {
        Row: {
          id: string;
          name: string;
          primary_muscle_id: number | null;
          secondary_muscle_ids: number[] | null;
          equipment: string | null;
          is_unilateral: boolean;
          owner_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          primary_muscle_id?: number | null;
          secondary_muscle_ids?: number[] | null;
          equipment?: string | null;
          is_unilateral?: boolean;
          owner_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          primary_muscle_id?: number | null;
          secondary_muscle_ids?: number[] | null;
          equipment?: string | null;
          is_unilateral?: boolean;
          owner_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      routine_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          owner_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          owner_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          owner_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      routine_template_exercises: {
        Row: {
          id: string;
          template_id: string;
          exercise_id: string;
          order_index: number;
          target_sets: number | null;
          target_reps_min: number | null;
          target_reps_max: number | null;
          rest_seconds: number | null;
        };
        Insert: {
          id?: string;
          template_id: string;
          exercise_id: string;
          order_index: number;
          target_sets?: number | null;
          target_reps_min?: number | null;
          target_reps_max?: number | null;
          rest_seconds?: number | null;
        };
        Update: {
          id?: string;
          template_id?: string;
          exercise_id?: string;
          order_index?: number;
          target_sets?: number | null;
          target_reps_min?: number | null;
          target_reps_max?: number | null;
          rest_seconds?: number | null;
        };
        Relationships: [];
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          template_id: string | null;
          name: string | null;
          started_at: string;
          ended_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id?: string | null;
          name?: string | null;
          started_at: string;
          ended_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          template_id?: string | null;
          name?: string | null;
          started_at?: string;
          ended_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      session_exercises: {
        Row: {
          id: string;
          session_id: string;
          exercise_id: string;
          order_index: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          exercise_id: string;
          order_index: number;
          notes?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          exercise_id?: string;
          order_index?: number;
          notes?: string | null;
        };
        Relationships: [];
      };
      sets: {
        Row: {
          id: string;
          session_exercise_id: string;
          set_index: number;
          reps: number;
          weight_kg: number;
          rpe: number | null;
          is_warmup: boolean;
          completed_at: string;
        };
        Insert: {
          id?: string;
          session_exercise_id: string;
          set_index: number;
          reps: number;
          weight_kg: number;
          rpe?: number | null;
          is_warmup?: boolean;
          completed_at?: string;
        };
        Update: {
          id?: string;
          session_exercise_id?: string;
          set_index?: number;
          reps?: number;
          weight_kg?: number;
          rpe?: number | null;
          is_warmup?: boolean;
          completed_at?: string;
        };
        Relationships: [];
      };
      personal_records: {
        Row: {
          user_id: string;
          exercise_id: string;
          best_1rm_kg: number | null;
          best_weight_kg: number | null;
          best_volume_kg: number | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          exercise_id: string;
          best_1rm_kg?: number | null;
          best_weight_kg?: number | null;
          best_volume_kg?: number | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          exercise_id?: string;
          best_1rm_kg?: number | null;
          best_weight_kg?: number | null;
          best_volume_kg?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type MuscleGroup = Database['public']['Tables']['muscle_groups']['Row'];
export type Exercise = Database['public']['Tables']['exercises']['Row'];
export type RoutineTemplate = Database['public']['Tables']['routine_templates']['Row'];
export type RoutineTemplateExercise =
  Database['public']['Tables']['routine_template_exercises']['Row'];
export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row'];
export type SessionExercise = Database['public']['Tables']['session_exercises']['Row'];
export type SetRow = Database['public']['Tables']['sets']['Row'];
export type PersonalRecord = Database['public']['Tables']['personal_records']['Row'];
