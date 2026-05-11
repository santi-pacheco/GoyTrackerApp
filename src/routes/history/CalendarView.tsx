import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, isSameDay, parseISO, startOfWeek } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSessions } from '@/hooks/useSessions';

export default function CalendarView() {
  const { sessions, loading } = useSessions();
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  const trainedDays = useMemo(
    () => sessions.map((s) => parseISO(s.started_at)),
    [sessions]
  );

  const sessionsByWeek = useMemo(() => {
    const m = new Map<string, typeof sessions>();
    for (const s of sessions) {
      const wk = startOfWeek(parseISO(s.started_at), { weekStartsOn: 1 });
      const key = format(wk, 'yyyy-MM-dd');
      const arr = m.get(key) ?? [];
      arr.push(s);
      m.set(key, arr);
    }
    return Array.from(m.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [sessions]);

  const dailyList = selected ? sessions.filter((s) => isSameDay(parseISO(s.started_at), selected)) : [];

  if (loading) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  return (
    <Tabs defaultValue="calendar" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="calendar">Calendario</TabsTrigger>
        <TabsTrigger value="list">Lista</TabsTrigger>
      </TabsList>

      <TabsContent value="calendar" className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected}
              modifiers={{ trained: trainedDays }}
              modifiersClassNames={{
                trained: 'bg-primary/30 text-foreground font-bold',
              }}
            />
          </CardContent>
        </Card>
        {selected && (
          <div className="space-y-2">
            {dailyList.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Sin entrenos el {format(selected, 'd MMM yyyy')}.
              </p>
            )}
            {dailyList.map((s) => (
              <SessionListItem key={s.id} session={s} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="list" className="space-y-4">
        {sessionsByWeek.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin historial todavía.</p>
        )}
        {sessionsByWeek.map(([weekKey, weekSessions]) => (
          <div key={weekKey} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Semana del {format(parseISO(weekKey), 'd MMM')}
            </h3>
            {weekSessions.map((s) => (
              <SessionListItem key={s.id} session={s} />
            ))}
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}

function SessionListItem({
  session,
}: {
  session: ReturnType<typeof useSessions>['sessions'][number];
}) {
  return (
    <Link to={`/history/${session.id}`}>
      <Card className="transition-colors hover:bg-accent">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{session.name || 'Workout'}</CardTitle>
        </CardHeader>
        <CardContent className="pb-4 text-xs text-muted-foreground">
          {format(parseISO(session.started_at), "d MMM yyyy 'a las' HH:mm")} ·{' '}
          {session.totalSets} series · {session.totalVolume.toFixed(0)} kg
        </CardContent>
      </Card>
    </Link>
  );
}
