import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useExercises, useMuscleGroups } from '@/hooks/useExercises';
import { useSessionStore } from '@/stores/sessionStore';
import { cn } from '@/lib/utils';

export function AddExerciseDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { exercises } = useExercises();
  const groups = useMuscleGroups();
  const addExercise = useSessionStore((s) => s.addExercise);
  const [query, setQuery] = useState('');
  const [muscleId, setMuscleId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((ex) => {
      if (muscleId !== null && ex.primary_muscle_id !== muscleId) return false;
      if (q && !ex.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [exercises, query, muscleId]);

  function pick(exerciseId: string, exerciseName: string) {
    addExercise({ exercise_id: exerciseId, exercise_name: exerciseName });
    onOpenChange(false);
    setQuery('');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Añadir ejercicio</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMuscleId(null)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs',
                muscleId === null
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background'
              )}
            >
              Todos
            </button>
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setMuscleId(g.id)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs capitalize',
                  muscleId === g.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input bg-background'
                )}
              >
                {g.name}
              </button>
            ))}
          </div>
          <div className="max-h-[50vh] space-y-1 overflow-y-auto pr-1">
            {filtered.map((ex) => (
              <Button
                key={ex.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => pick(ex.id, ex.name)}
              >
                <div className="text-left">
                  <div>{ex.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {groups.find((g) => g.id === ex.primary_muscle_id)?.name ?? '—'}
                  </div>
                </div>
              </Button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">Sin resultados.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
