import { useMemo } from 'react';
import { subDays, format, startOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AnalyticsSet } from '@/hooks/useAnalyticsData';

const DAYS = 26 * 7; // ~26 weeks

export function FrequencyHeatmap({ data }: { data: AnalyticsSet[] }) {
  const setsByDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of data) {
      if (s.is_warmup) continue;
      const day = s.started_at.slice(0, 10);
      m.set(day, (m.get(day) ?? 0) + 1);
    }
    return m;
  }, [data]);

  const cells = useMemo(() => {
    const today = startOfDay(new Date());
    const arr: Array<{ day: string; count: number }> = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = subDays(today, i);
      const key = format(d, 'yyyy-MM-dd');
      arr.push({ day: key, count: setsByDay.get(key) ?? 0 });
    }
    return arr;
  }, [setsByDay]);

  function intensity(n: number) {
    if (n === 0) return 'bg-muted';
    if (n < 6) return 'bg-emerald-900';
    if (n < 12) return 'bg-emerald-700';
    if (n < 20) return 'bg-emerald-500';
    return 'bg-emerald-400';
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Frecuencia (26 sem.)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-flow-col grid-rows-7 gap-[3px] overflow-x-auto">
          {cells.map((c) => (
            <div
              key={c.day}
              title={`${c.day} · ${c.count} series`}
              className={cn('h-3 w-3 rounded-sm', intensity(c.count))}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
