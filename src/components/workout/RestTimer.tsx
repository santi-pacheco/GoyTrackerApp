import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useTimerStore } from '@/stores/timerStore';
import { notifyRestDone } from '@/lib/notify';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function RestTimer() {
  const endsAt = useTimerStore((s) => s.endsAt);
  const total = useTimerStore((s) => s.totalSeconds);
  const exerciseName = useTimerStore((s) => s.exerciseName);
  const stop = useTimerStore((s) => s.stop);
  const addSeconds = useTimerStore((s) => s.addSeconds);
  const [now, setNow] = useState(Date.now());
  const firedRef = useRef(false);

  useEffect(() => {
    if (!endsAt) return;
    firedRef.current = false;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [endsAt]);

  useEffect(() => {
    if (!endsAt) return;
    if (!firedRef.current && now >= endsAt) {
      firedRef.current = true;
      notifyRestDone(exerciseName);
    }
  }, [now, endsAt, exerciseName]);

  if (!endsAt) return null;

  const remainingMs = endsAt - now;
  const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
  const done = remainingMs <= 0;
  const pct = total > 0 ? Math.max(0, Math.min(1, remainingMs / (total * 1000))) : 0;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md px-4">
      <div
        className={cn(
          'overflow-hidden rounded-lg border bg-card shadow-lg transition-colors',
          done && 'border-emerald-500'
        )}
      >
        <div className="h-1 bg-muted">
          <div
            className={cn('h-full transition-all', done ? 'bg-emerald-500' : 'bg-primary')}
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-2 p-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              {done ? 'Listo' : 'Descanso'} · {exerciseName || '—'}
            </span>
            <span className="text-lg font-bold tabular-nums">
              {Math.floor(remainingSec / 60)}:{(remainingSec % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => addSeconds(-15)} disabled={done}>
              -15
            </Button>
            <Button size="sm" variant="outline" onClick={() => addSeconds(15)}>
              <Plus className="mr-1 h-3 w-3" />
              15
            </Button>
            <Button size="icon" variant="ghost" onClick={stop} title="Cerrar">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
