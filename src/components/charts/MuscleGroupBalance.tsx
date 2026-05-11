import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMuscleGroups } from '@/hooks/useExercises';
import type { AnalyticsSet } from '@/hooks/useAnalyticsData';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#a855f7', '#06b6d4'];

export function MuscleGroupBalance({ data }: { data: AnalyticsSet[] }) {
  const groups = useMuscleGroups();

  const chartData = useMemo(() => {
    const cutoff = subDays(new Date(), 28).toISOString();
    const byMuscle = new Map<number, number>();
    for (const s of data) {
      if (s.is_warmup) continue;
      if (s.started_at < cutoff) continue;
      if (s.primary_muscle_id == null) continue;
      byMuscle.set(s.primary_muscle_id, (byMuscle.get(s.primary_muscle_id) ?? 0) + s.reps * s.weight_kg);
    }
    return Array.from(byMuscle.entries()).map(([id, kg]) => ({
      name: groups.find((g) => g.id === id)?.name ?? `#${id}`,
      kg: Math.round(kg),
    }));
  }, [data, groups]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Balance muscular (28d)</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Sin datos.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={chartData} dataKey="kg" nameKey="name" outerRadius={80} label>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 6,
                }}
                formatter={(v: number) => [`${v} kg`, 'Volumen']}
              />
              <Legend wrapperStyle={{ fontSize: 12, textTransform: 'capitalize' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
