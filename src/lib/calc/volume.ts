// Volume = reps * weight (kg). Warmup sets excluded by convention.

export function setVolume(reps: number, weightKg: number): number {
  return reps * weightKg;
}

export function totalVolume(sets: Array<{ weight_kg: number; reps: number; is_warmup?: boolean }>): number {
  return sets.reduce((sum, s) => (s.is_warmup ? sum : sum + setVolume(s.reps, s.weight_kg)), 0);
}

// Group sets by ISO week (YYYY-Www) for weekly volume aggregation.
export function weekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}
