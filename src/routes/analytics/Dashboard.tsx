import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { OneRMChart } from '@/components/charts/OneRMChart';
import { VolumeChart } from '@/components/charts/VolumeChart';
import { FrequencyHeatmap } from '@/components/charts/FrequencyHeatmap';
import { MuscleGroupBalance } from '@/components/charts/MuscleGroupBalance';

export default function Dashboard() {
  const { data, loading } = useAnalyticsData();

  if (loading) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin datos todavía. Completa un workout para ver tus analytics.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <OneRMChart data={data} />
      <VolumeChart data={data} />
      <FrequencyHeatmap data={data} />
      <MuscleGroupBalance data={data} />
    </div>
  );
}
