import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Exercise, MuscleGroup } from '@/types/database';

export function useMuscleGroups() {
  const [groups, setGroups] = useState<MuscleGroup[]>([]);
  useEffect(() => {
    void supabase
      .from('muscle_groups')
      .select('*')
      .order('id')
      .then(({ data }) => setGroups(data ?? []));
  }, []);
  return groups;
}

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const { data } = await supabase.from('exercises').select('*').order('name');
    setExercises(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  return { exercises, loading, refresh };
}
