import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Flame, Dumbbell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, formatKg } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useExercises } from '@/hooks/useExercises';
import {
  useVolumeLeaderboard,
  useFrequencyLeaderboard,
  usePrLeaderboard,
} from '@/hooks/useLeaderboard';

const PERIODS = [
  { label: '7 días', value: 7 },
  { label: '30 días', value: 30 },
  { label: '90 días', value: 90 },
  { label: '1 año', value: 365 },
];

export default function Leaderboard() {
  return (
    <Tabs defaultValue="volume" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="volume">
          <Trophy className="mr-1 h-4 w-4" /> Volumen
        </TabsTrigger>
        <TabsTrigger value="frequency">
          <Flame className="mr-1 h-4 w-4" /> Freq.
        </TabsTrigger>
        <TabsTrigger value="pr">
          <Dumbbell className="mr-1 h-4 w-4" /> 1RM
        </TabsTrigger>
      </TabsList>

      <TabsContent value="volume">
        <VolumeBoard />
      </TabsContent>
      <TabsContent value="frequency">
        <FrequencyBoard />
      </TabsContent>
      <TabsContent value="pr">
        <PrBoard />
      </TabsContent>
    </Tabs>
  );
}

function PeriodSelect({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger className="w-32">
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
  );
}

function VolumeBoard() {
  const [period, setPeriod] = useState(30);
  const { rows, loading } = useVolumeLeaderboard(period);
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Volumen total</CardTitle>
        <PeriodSelect value={period} onChange={setPeriod} />
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && <p className="text-sm text-muted-foreground">Cargando…</p>}
        {!loading && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin datos.</p>
        )}
        {rows.map((r, i) => (
          <Row
            key={r.user_id}
            rank={i + 1}
            isYou={r.user_id === user?.id}
            userId={r.user_id}
            name={r.display_name}
            primary={formatKg(Number(r.total_volume_kg))}
            secondary={`${r.session_count} sesiones`}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function FrequencyBoard() {
  const [period, setPeriod] = useState(30);
  const { rows, loading } = useFrequencyLeaderboard(period);
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">Días entrenados</CardTitle>
        <PeriodSelect value={period} onChange={setPeriod} />
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && <p className="text-sm text-muted-foreground">Cargando…</p>}
        {!loading && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin datos.</p>
        )}
        {rows.map((r, i) => (
          <Row
            key={r.user_id}
            rank={i + 1}
            isYou={r.user_id === user?.id}
            userId={r.user_id}
            name={r.display_name}
            primary={`${r.training_days} días`}
            secondary={`${r.session_count} sesiones · ${r.total_sets} series`}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function PrBoard() {
  const { exercises } = useExercises();
  const popular = useMemo(() => {
    const preferred = ['Barbell Bench Press', 'Back Squat', 'Deadlift', 'Overhead Press', 'Barbell Row'];
    const sorted = [...exercises].sort((a, b) => {
      const ai = preferred.indexOf(a.name);
      const bi = preferred.indexOf(b.name);
      if (ai === -1 && bi === -1) return a.name.localeCompare(b.name);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return sorted;
  }, [exercises]);

  const [exerciseId, setExerciseId] = useState<string>('');
  const effectiveId = exerciseId || popular[0]?.id || null;
  const { rows, loading } = usePrLeaderboard(effectiveId);
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="text-base">Mejor 1RM estimado</CardTitle>
        <Select value={effectiveId ?? ''} onValueChange={setExerciseId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona ejercicio" />
          </SelectTrigger>
          <SelectContent>
            {popular.map((ex) => (
              <SelectItem key={ex.id} value={ex.id}>
                {ex.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && <p className="text-sm text-muted-foreground">Cargando…</p>}
        {!loading && rows.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin datos para este ejercicio.</p>
        )}
        {rows.map((r, i) => (
          <Row
            key={r.user_id}
            rank={i + 1}
            isYou={r.user_id === user?.id}
            userId={r.user_id}
            name={r.display_name}
            primary={formatKg(Number(r.best_1rm_kg))}
            secondary={
              r.best_weight_kg > 0
                ? `${formatKg(Number(r.best_weight_kg))} × ${r.best_reps}`
                : '—'
            }
          />
        ))}
      </CardContent>
    </Card>
  );
}

function Row({
  rank,
  isYou,
  userId,
  name,
  primary,
  secondary,
}: {
  rank: number;
  isYou: boolean;
  userId: string;
  name: string;
  primary: string;
  secondary: string;
}) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  return (
    <Link to={`/leaderboard/${userId}`}>
      <div
        className={cn(
          'flex items-center justify-between rounded-md border px-3 py-2 transition-colors hover:bg-accent',
          isYou && 'border-primary bg-primary/10'
        )}
      >
        <div className="flex items-center gap-3">
          <span className="w-6 text-center text-sm font-bold tabular-nums">
            {medal ?? rank}
          </span>
          <div>
            <div className="text-sm font-medium">
              {name}
              {isYou && <span className="ml-2 text-xs text-primary">tú</span>}
            </div>
            <div className="text-xs text-muted-foreground">{secondary}</div>
          </div>
        </div>
        <div className="text-sm font-semibold tabular-nums">{primary}</div>
      </div>
    </Link>
  );
}
