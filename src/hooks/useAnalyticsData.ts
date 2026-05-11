import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type AnalyticsSet = {
  id: string;
  reps: number;
  weight_kg: number;
  is_warmup: boolean;
  set_index: number;
  // joined
  started_at: string;          // session started_at
  exercise_id: string;
  exercise_name: string;
  primary_muscle_id: number | null;
};

type RawSet = {
  id: string;
  reps: number;
  weight_kg: number;
  is_warmup: boolean;
  set_index: number;
  session_exercise: {
    exercise: {
      id: string;
      name: string;
      primary_muscle_id: number | null;
    } | null;
    session: {
      id: string;
      started_at: string;
    } | null;
  } | null;
};

export function useAnalyticsData() {
  const [data, setData] = useState<AnalyticsSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('sets')
        .select(
          'id, reps, weight_kg, is_warmup, set_index, session_exercise:session_exercises!inner(exercise:exercises!inner(id, name, primary_muscle_id), session:workout_sessions!inner(id, started_at))'
        )
        .order('id');
      const raw = (data as unknown as RawSet[]) ?? [];
      const flat: AnalyticsSet[] = [];
      for (const r of raw) {
        const ex = r.session_exercise?.exercise;
        const ses = r.session_exercise?.session;
        if (!ex || !ses) continue;
        flat.push({
          id: r.id,
          reps: r.reps,
          weight_kg: r.weight_kg,
          is_warmup: r.is_warmup,
          set_index: r.set_index,
          started_at: ses.started_at,
          exercise_id: ex.id,
          exercise_name: ex.name,
          primary_muscle_id: ex.primary_muscle_id,
        });
      }
      if (!cancelled) {
        setData(flat);
        setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading };
}
