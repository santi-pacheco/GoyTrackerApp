import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RoutineTemplate, RoutineTemplateExercise, Exercise } from '@/types/database';

export type TemplateWithExercises = RoutineTemplate & {
  items: Array<RoutineTemplateExercise & { exercise: Pick<Exercise, 'id' | 'name'> }>;
};

export function useTemplates() {
  const [templates, setTemplates] = useState<TemplateWithExercises[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const { data } = await supabase
      .from('routine_templates')
      .select(
        '*, items:routine_template_exercises(*, exercise:exercises(id, name))'
      )
      .order('name');
    setTemplates((data as unknown as TemplateWithExercises[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  return { templates, loading, refresh };
}
