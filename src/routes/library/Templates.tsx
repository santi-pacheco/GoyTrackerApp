import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTemplates, type TemplateWithExercises } from '@/hooks/useTemplates';
import { useSessionStore, type ActiveExercise } from '@/stores/sessionStore';
import { ensureNotificationPermission } from '@/lib/notify';

export default function Templates() {
  const { templates, loading } = useTemplates();
  const start = useSessionStore((s) => s.start);
  const active = useSessionStore((s) => s.active);
  const navigate = useNavigate();

  function startFromTemplate(t: TemplateWithExercises) {
    if (active && !confirm('Hay un workout activo. ¿Descartar y empezar nuevo?')) return;
    const exercises: ActiveExercise[] = [...t.items]
      .sort((a, b) => a.order_index - b.order_index)
      .map((item) => ({
        id: uuid(),
        exercise_id: item.exercise.id,
        exercise_name: item.exercise.name,
        rest_seconds: item.rest_seconds ?? 90,
        notes: '',
        sets: Array.from({ length: item.target_sets ?? 3 }).map(() => ({
          id: uuid(),
          reps: 0,
          weight_kg: 0,
          rpe: null,
          is_warmup: false,
          completed: false,
        })),
      }));
    start({ template_id: t.id, name: t.name, exercises });
    void ensureNotificationPermission();
    navigate('/');
  }

  if (loading) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  return (
    <div className="space-y-3">
      {templates.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Sin templates. Aplica `0002_seed_exercises.sql` en Supabase.
        </p>
      )}
      {templates.map((t) => (
        <Card key={t.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              {t.name}
              {t.owner_id ? <span className="ml-2 text-xs text-muted-foreground">custom</span> : null}
            </CardTitle>
            {t.description && (
              <p className="text-xs text-muted-foreground">{t.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-3 pb-4">
            <ul className="space-y-1 text-sm text-muted-foreground">
              {[...t.items]
                .sort((a, b) => a.order_index - b.order_index)
                .map((it) => (
                  <li key={it.id}>
                    · {it.exercise.name}
                    {it.target_sets ? (
                      <span className="ml-1">
                        {it.target_sets}×{it.target_reps_min}-{it.target_reps_max}
                      </span>
                    ) : null}
                  </li>
                ))}
            </ul>
            <Button size="sm" onClick={() => startFromTemplate(t)} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Empezar
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
