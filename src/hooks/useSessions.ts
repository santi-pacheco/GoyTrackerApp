import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { WorkoutSession, SessionExercise, SetRow, Exercise } from '@/types/database';

export type SessionSummary = WorkoutSession & {
  totalSets: number;
  totalVolume: number;
};

export function useSessions() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const { data } = await supabase
      .from('workout_sessions')
      .select(
        '*, session_exercises(id, sets(reps, weight_kg, is_warmup))'
      )
      .order('started_at', { ascending: false });
    type Raw = WorkoutSession & {
      session_exercises: Array<{
        id: string;
        sets: Array<{ reps: number; weight_kg: number; is_warmup: boolean }>;
      }>;
    };
    const summaries: SessionSummary[] = ((data as unknown as Raw[]) ?? []).map((s) => {
      let totalSets = 0;
      let totalVolume = 0;
      for (const se of s.session_exercises ?? []) {
        for (const st of se.sets ?? []) {
          if (st.is_warmup) continue;
          totalSets++;
          totalVolume += st.reps * st.weight_kg;
        }
      }
      const { session_exercises: _ignored, ...rest } = s;
      void _ignored;
      return { ...rest, totalSets, totalVolume };
    });
    setSessions(summaries);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  return { sessions, loading, refresh };
}

export type SessionDetail = WorkoutSession & {
  session_exercises: Array<
    SessionExercise & {
      exercise: Pick<Exercise, 'id' | 'name'>;
      sets: SetRow[];
    }
  >;
};

export async function fetchSessionDetail(id: string): Promise<SessionDetail | null> {
  const { data } = await supabase
    .from('workout_sessions')
    .select(
      '*, session_exercises(*, exercise:exercises(id, name), sets(*))'
    )
    .eq('id', id)
    .single();
  return (data as unknown as SessionDetail) ?? null;
}
