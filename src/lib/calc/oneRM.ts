// Epley formula: estimated 1RM = weight * (1 + reps/30)
// Most accurate for reps in 1–10 range.

export function epley1RM(weightKg: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

// Best 1RM across a list of sets (use non-warmup sets only)
export function best1RM(sets: Array<{ weight_kg: number; reps: number; is_warmup?: boolean }>): number {
  let best = 0;
  for (const s of sets) {
    if (s.is_warmup) continue;
    const est = epley1RM(s.weight_kg, s.reps);
    if (est > best) best = est;
  }
  return best;
}
