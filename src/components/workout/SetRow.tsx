import { Check, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSessionStore, type ActiveSet } from '@/stores/sessionStore';
import { useTimerStore } from '@/stores/timerStore';

export function SetRow({
  exerciseId,
  exerciseName,
  restSeconds,
  set,
  index,
}: {
  exerciseId: string;
  exerciseName: string;
  restSeconds: number;
  set: ActiveSet;
  index: number;
}) {
  const update = useSessionStore((s) => s.updateSet);
  const toggle = useSessionStore((s) => s.toggleSetComplete);
  const remove = useSessionStore((s) => s.removeSet);
  const startTimer = useTimerStore((s) => s.start);

  function handleToggle() {
    const willComplete = !set.completed;
    toggle(exerciseId, set.id);
    if (willComplete && !set.is_warmup && set.reps > 0) {
      startTimer(restSeconds, exerciseName);
    }
  }

  return (
    <div
      className={cn(
        'grid grid-cols-[2rem_1fr_1fr_3.5rem_2.25rem_2.25rem] items-center gap-2 rounded-md px-1 py-1',
        set.completed && 'bg-emerald-500/10'
      )}
    >
      <button
        type="button"
        onClick={() => update(exerciseId, set.id, { is_warmup: !set.is_warmup })}
        className={cn(
          'text-xs font-semibold',
          set.is_warmup ? 'text-amber-500' : 'text-muted-foreground'
        )}
        title="Toggle warmup"
      >
        {set.is_warmup ? 'W' : index + 1}
      </button>

      <Input
        type="number"
        inputMode="decimal"
        step="0.5"
        value={set.weight_kg || ''}
        placeholder="kg"
        onChange={(e) => update(exerciseId, set.id, { weight_kg: Number(e.target.value) || 0 })}
        className="h-9 text-center"
      />

      <Input
        type="number"
        inputMode="numeric"
        value={set.reps || ''}
        placeholder="reps"
        onChange={(e) => update(exerciseId, set.id, { reps: Number(e.target.value) || 0 })}
        className="h-9 text-center"
      />

      <Input
        type="number"
        inputMode="decimal"
        step="0.5"
        min={1}
        max={10}
        value={set.rpe ?? ''}
        placeholder="RPE"
        onChange={(e) =>
          update(exerciseId, set.id, {
            rpe: e.target.value === '' ? null : Number(e.target.value),
          })
        }
        className="h-9 text-center"
      />

      <Button
        type="button"
        size="icon"
        variant={set.completed ? 'default' : 'outline'}
        onClick={handleToggle}
        className="h-9 w-9"
      >
        <Check className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={() => remove(exerciseId, set.id)}
        className="h-9 w-9 text-muted-foreground"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
