import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useUserStats, useUserWeeklyVolume } from '@/hooks/useLeaderboard';
import { formatKg } from '@/lib/utils';

const PERIODS = [
  { label: '7 días', value: 7 },
  { label: '30 días', value: 30 },
  { label: '90 días', value: 90 },
];

export default function Compare() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [period, setPeriod] = useState(30);

  const otherId = userId ?? null;
  const meId = user?.id ?? null;
  const isSelf = otherId === meId;

  const { stats: other } = useUserStats(otherId, period);
  const { stats: me } = useUserStats(meId, period);
  const { rows: otherWeekly } = useUserWeeklyVolume(otherId, 12);
  const { rows: meWeekly } = useUserWeeklyVolume(meId, 12);

  const chartData = useMemo(() => {
    const map = new Map<string, { week: string; me?: number; other?: number }>();
    for (const r of meWeekly) {
      map.set(r.week_start, { week: r.week_start, me: Number(r.total_volume_kg) });
    }
    for (const r of otherWeekly) {
      const ex = map.get(r.week_start) ?? { week: r.week_start };
      ex.other = Number(r.total_volume_kg);
      map.set(r.week_start, ex);
    }
    return Array.from(map.values()).sort((a, b) => (a.week < b.week ? -1 : 1));
  }, [meWeekly, otherWeekly]);

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to="/leaderboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">
            {isSelf ? 'Tus stats' : `${other?.display_name ?? '…'} vs tú`}
          </CardTitle>
          <Select value={String(period)} onValueChange={(v) => setPeriod(Number(v))}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={String(p.value)}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Header label={other?.display_name ?? '…'} highlight={!isSelf} />
            <Header label="Tú" />

            <StatCell value={formatKg(Number(other?.total_volume_kg ?? 0))} compare={Number(other?.total_volume_kg ?? 0)} other={Number(me?.total_volume_kg ?? 0)} bigger="up" />
            <StatCell value={formatKg(Number(me?.total_volume_kg ?? 0))} compare={Number(me?.total_volume_kg ?? 0)} other={Number(other?.total_volume_kg ?? 0)} bigger="up" />
            <Label>Volumen</Label>
            <Label />

            <StatCell value={`${other?.session_count ?? 0}`} compare={other?.session_count ?? 0} other={me?.session_count ?? 0} bigger="up" />
            <StatCell value={`${me?.session_count ?? 0}`} compare={me?.session_count ?? 0} other={other?.session_count ?? 0} bigger="up" />
            <Label>Sesiones</Label>
            <Label />

            <StatCell value={`${other?.training_days ?? 0}`} compare={other?.training_days ?? 0} other={me?.training_days ?? 0} bigger="up" />
            <StatCell value={`${me?.training_days ?? 0}`} compare={me?.training_days ?? 0} other={other?.training_days ?? 0} bigger="up" />
            <Label>Días</Label>
            <Label />

            <StatCell value={`${other?.total_sets ?? 0}`} compare={other?.total_sets ?? 0} other={me?.total_sets ?? 0} bigger="up" />
            <StatCell value={`${me?.total_sets ?? 0}`} compare={me?.total_sets ?? 0} other={other?.total_sets ?? 0} bigger="up" />
            <Label>Series</Label>
            <Label />

            <StatCell value={formatKg(Number(other?.avg_volume_per_session ?? 0))} compare={Number(other?.avg_volume_per_session ?? 0)} other={Number(me?.avg_volume_per_session ?? 0)} bigger="up" />
            <StatCell value={formatKg(Number(me?.avg_volume_per_session ?? 0))} compare={Number(me?.avg_volume_per_session ?? 0)} other={Number(other?.avg_volume_per_session ?? 0)} bigger="up" />
            <Label>Vol/sesión</Label>
            <Label />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Volumen semanal (12 sem.)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Sin datos.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="week"
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
                  formatter={(v: number, name: string) => [`${v} kg`, name === 'me' ? 'Tú' : other?.display_name ?? 'Rival']}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="me" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="me" />
                {!isSelf && (
                  <Line type="monotone" dataKey="other" stroke="#f59e0b" strokeWidth={2} dot={false} name="other" />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Header({ label, highlight }: { label: string; highlight?: boolean }) {
  return (
    <div className={highlight ? 'text-sm font-semibold text-amber-500' : 'text-sm font-semibold'}>
      {label}
    </div>
  );
}

function Label({ children }: { children?: React.ReactNode }) {
  return <div className="text-xs uppercase tracking-wide text-muted-foreground">{children}</div>;
}

function StatCell({
  value,
  compare,
  other,
}: {
  value: string;
  compare: number;
  other: number;
  bigger: 'up' | 'down';
}) {
  const wins = compare > other;
  const ties = compare === other;
  return (
    <div className={`text-lg font-bold tabular-nums ${ties ? 'text-muted-foreground' : wins ? 'text-emerald-500' : 'text-muted-foreground'}`}>
      {value}
    </div>
  );
}
