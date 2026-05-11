import { useState } from 'react';
import { Plus, Play, Save, Trash } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { AddExerciseDialog } from '@/components/workout/AddExerciseDialog';
import { persistFinishedSession } from '@/lib/workout/persist';
import { totalVolume } from '@/lib/calc/volume';
import { ensureNotificationPermission } from '@/lib/notify';

export default function ActiveSession() {
  const { user } = useAuth();
  const active = useSessionStore((s) => s.active);
  const start = useSessionStore((s) => s.start);
  const end = useSessionStore((s) => s.end);
  const cancel = useSessionStore((s) => s.cancel);
  const rename = useSessionStore((s) => s.rename);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!active) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Sin sesión activa. Empieza una rutina libre o usa un template en Library.
          </p>
          <Button
            onClick={() => {
              start();
              void ensureNotificationPermission();
            }}
            className="w-full"
          >
            <Play className="mr-2 h-4 w-4" />
            Empezar workout
          </Button>
        </CardContent>
      </Card>
    );
  }

  const allSets = active.exercises.flatMap((e) =>
    e.sets.filter((s) => s.completed).map((s) => ({ ...s, weight_kg: s.weight_kg, reps: s.reps }))
  );
  const totalKg = totalVolume(allSets);
  const completedCount = allSets.length;

  async function finish() {
    if (!user || !active) return;
    setError(null);
    setSaving(true);
    try {
      const { queued } = await persistFinishedSession(active, user.id);
      end();
      if (queued) {
        alert('Sin conexión: workout guardado localmente. Se sincronizará al volver online.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error guardando');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 pt-6">
          <Input
            value={active.name}
            onChange={(e) => rename(e.target.value)}
            placeholder="Nombre del workout"
            className="text-lg font-semibold"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedCount} series · {totalKg.toFixed(0)} kg</span>
            <span>{new Date(active.started_at).toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>

      {active.exercises.map((ex) => (
        <ExerciseCard key={ex.id} exercise={ex} />
      ))}

      <Button onClick={() => setPickerOpen(true)} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Añadir ejercicio
      </Button>

      <AddExerciseDialog open={pickerOpen} onOpenChange={setPickerOpen} />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="destructive"
          onClick={() => {
            if (confirm('¿Descartar workout sin guardar?')) cancel();
          }}
        >
          <Trash className="mr-2 h-4 w-4" />
          Descartar
        </Button>
        <Button onClick={() => void finish()} disabled={saving || completedCount === 0}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Guardando…' : 'Finalizar'}
        </Button>
      </div>
    </div>
  );
}
