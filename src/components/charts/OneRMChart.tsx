import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { epley1RM } from '@/lib/calc/oneRM';
import type { AnalyticsSet } from '@/hooks/useAnalyticsData';

export function OneRMChart({ data }: { data: AnalyticsSet[] }) {
  const exercises = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of data) m.set(s.exercise_id, s.exercise_name);
    return Array.from(m.entries()).map(([id, name]) => ({ id, name }));
  }, [data]);

  const [exerciseId, setExerciseId] = useState<string>(exercises[0]?.id ?? '');

  const chartData = useMemo(() => {
    const cutoff = subDays(new Date(), 90).toISOString();
    const byDay = new Map<string, number>();
    for (const s of data) {
      if (s.exercise_id !== exerciseId) continue;
      if (s.is_warmup) continue;
      if (s.started_at < cutoff) continue;
      const day = s.started_at.slice(0, 10);
      const est = epley1RM(s.weight_kg, s.reps);
      const prev = byDay.get(day) ?? 0;
      if (est > prev) byDay.set(day, est);
    }
    return Array.from(byDay.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([day, kg]) => ({ day, kg: Math.round(kg * 10) / 10 }));
  }, [data, exerciseId]);

  return (
    <Card>
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="text-base">1RM estimado (Epley)</CardTitle>
        <Select value={exerciseId} onValueChange={setExerciseId}>
          <SelectTrigger>
            <SelectValue placeholder="Ejercicio" />
          </SelectTrigger>
          <SelectContent>
            {exercises.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Sin datos en 90 días.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="day"
                tickFormatter={(d: string) => format(parseISO(d), 'd MMM')}
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 6,
                }}
                labelFormatter={(d: string) => format(parseISO(d), 'd MMM yyyy')}
                formatter={(v: number) => [`${v} kg`, '1RM est.']}
              />
              <Line type="monotone" dataKey="kg" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
