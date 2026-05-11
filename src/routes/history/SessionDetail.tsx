import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { v4 as uuid } from 'uuid';
import { ArrowLeft, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchSessionDetail, type SessionDetail } from '@/hooks/useSessions';
import { useSessionStore, type ActiveExercise } from '@/stores/sessionStore';
import { formatKg } from '@/lib/utils';

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const start = useSessionStore((s) => s.start);
  const active = useSessionStore((s) => s.active);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    void fetchSessionDetail(id).then((d) => {
      setDetail(d);
      setLoading(false);
    });
  }, [id]);

  function repeat() {
    if (!detail) return;
    if (active && !confirm('Hay un workout activo. ¿Descartar y empezar nuevo?')) return;
    const exercises: ActiveExercise[] = [...(detail.session_exercises ?? [])]
      .sort((a, b) => a.order_index - b.order_index)
      .map((se) => ({
        id: uuid(),
        exercise_id: se.exercise.id,
        exercise_name: se.exercise.name,
        rest_seconds: 90,
        notes: se.notes ?? '',
        sets: [...se.sets]
          .sort((a, b) => a.set_index - b.set_index)
          .map((st) => ({
            id: uuid(),
            reps: st.reps,
            weight_kg: st.weight_kg,
            rpe: null,
            is_warmup: st.is_warmup,
            completed: false,
          })),
      }));
    start({ name: detail.name ?? 'Workout', exercises });
    navigate('/');
  }

  if (loading) return <p className="text-sm text-muted-foreground">Cargando…</p>;
  if (!detail) return <p className="text-sm text-destructive">Sesión no encontrada.</p>;

  const totalVolume =
    detail.session_exercises?.reduce(
      (sum, se) =>
        sum +
        se.sets.reduce((s2, st) => (st.is_warmup ? s2 : s2 + st.reps * st.weight_kg), 0),
      0
    ) ?? 0;

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to="/history">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{detail.name || 'Workout'}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {format(parseISO(detail.started_at), "d MMM yyyy 'a las' HH:mm")}
          </p>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Volumen total: {formatKg(totalVolume)}
        </CardContent>
      </Card>

      {[...(detail.session_exercises ?? [])]
        .sort((a, b) => a.order_index - b.order_index)
        .map((se) => (
          <Card key={se.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{se.exercise.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pb-4 text-sm">
              {[...se.sets]
                .sort((a, b) => a.set_index - b.set_index)
                .map((st) => (
                  <div key={st.id} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {st.is_warmup ? 'W' : st.set_index}
                    </span>
                    <span>
                      {formatKg(st.weight_kg)} × {st.reps}
                      {st.rpe ? <span className="ml-2 text-muted-foreground">RPE {st.rpe}</span> : null}
                    </span>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}

      <Button onClick={repeat} className="w-full">
        <Play className="mr-2 h-4 w-4" />
        Repetir workout
      </Button>
    </div>
  );
}
