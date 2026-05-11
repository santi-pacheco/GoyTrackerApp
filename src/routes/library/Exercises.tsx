import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useExercises, useMuscleGroups } from '@/hooks/useExercises';
import { NewExerciseDialog } from '@/components/library/NewExerciseDialog';

export default function Exercises() {
  const groups = useMuscleGroups();
  const { exercises, loading, refresh } = useExercises();
  const [query, setQuery] = useState('');
  const [muscleId, setMuscleId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((ex) => {
      if (muscleId !== null && ex.primary_muscle_id !== muscleId) return false;
      if (q && !ex.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [exercises, query, muscleId]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar ejercicio…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Chip active={muscleId === null} onClick={() => setMuscleId(null)}>
          Todos
        </Chip>
        {groups.map((g) => (
          <Chip key={g.id} active={muscleId === g.id} onClick={() => setMuscleId(g.id)}>
            {g.name}
          </Chip>
        ))}
      </div>

      <Button onClick={() => setOpen(true)} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Nuevo ejercicio
      </Button>

      <NewExerciseDialog
        open={open}
        onOpenChange={setOpen}
        muscleGroups={groups}
        onCreated={() => void refresh()}
      />

      <div className="space-y-2">
        {loading && <p className="text-sm text-muted-foreground">Cargando…</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin resultados.</p>
        )}
        {filtered.map((ex) => (
          <Card key={ex.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{ex.name}</div>
                <div className="text-xs text-muted-foreground">
                  {groups.find((g) => g.id === ex.primary_muscle_id)?.name ?? '—'}
                  {ex.equipment ? ` · ${ex.equipment}` : ''}
                  {ex.owner_id ? ' · custom' : ''}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs capitalize transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-background text-foreground hover:bg-accent'
      )}
    >
      {children}
    </button>
  );
}
