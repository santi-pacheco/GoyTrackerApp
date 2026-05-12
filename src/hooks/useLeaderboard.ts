import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Functions = Database['public']['Functions'];
type VolumeRow = Functions['leaderboard_volume']['Returns'][number];
type FrequencyRow = Functions['leaderboard_frequency']['Returns'][number];
type PrRow = Functions['leaderboard_pr_by_exercise']['Returns'][number];
type StatsRow = Functions['user_stats']['Returns'][number];
type WeeklyRow = Functions['user_weekly_volume']['Returns'][number];

export function useVolumeLeaderboard(periodDays = 30) {
  const [rows, setRows] = useState<VolumeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .rpc('leaderboard_volume', { period_days: periodDays })
      .then(({ data }) => {
        if (cancelled) return;
        setRows(data ?? []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [periodDays]);

  return { rows, loading };
}

export function useFrequencyLeaderboard(periodDays = 30) {
  const [rows, setRows] = useState<FrequencyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .rpc('leaderboard_frequency', { period_days: periodDays })
      .then(({ data }) => {
        if (cancelled) return;
        setRows(data ?? []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [periodDays]);

  return { rows, loading };
}

export function usePrLeaderboard(exerciseId: string | null) {
  const [rows, setRows] = useState<PrRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!exerciseId) {
      setRows([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .rpc('leaderboard_pr_by_exercise', { p_exercise_id: exerciseId })
      .then(({ data }) => {
        if (cancelled) return;
        setRows(data ?? []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  return { rows, loading };
}

export function useUserStats(userId: string | null, periodDays = 30) {
  const [stats, setStats] = useState<StatsRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setStats(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .rpc('user_stats', { p_user_id: userId, period_days: periodDays })
      .then(({ data }) => {
        if (cancelled) return;
        setStats(data?.[0] ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, periodDays]);

  return { stats, loading };
}

export function useUserWeeklyVolume(userId: string | null, weeks = 12) {
  const [rows, setRows] = useState<WeeklyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRows([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    supabase
      .rpc('user_weekly_volume', { p_user_id: userId, weeks })
      .then(({ data }) => {
        if (cancelled) return;
        setRows(data ?? []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, weeks]);

  return { rows, loading };
}

export type { VolumeRow, FrequencyRow, PrRow, StatsRow, WeeklyRow };
