import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { weekKey } from '@/lib/calc/volume';
import type { AnalyticsSet } from '@/hooks/useAnalyticsData';

export function VolumeChart({ data }: { data: AnalyticsSet[] }) {
  const chartData = useMemo(() => {
    const byWeek = new Map<string, number>();
    for (const s of data) {
      if (s.is_warmup) continue;
      const key = weekKey(new Date(s.started_at));
      byWeek.set(key, (byWeek.get(key) ?? 0) + s.reps * s.weight_kg);
    }
    return Array.from(byWeek.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .slice(-12)
      .map(([wk, kg]) => ({ wk, kg: Math.round(kg) }));
  }, [data]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Volumen semanal (12 sem.)</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Sin datos todavía.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="wk" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 6,
                }}
                formatter={(v: number) => [`${v} kg`, 'Volumen']}
              />
              <Bar dataKey="kg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
