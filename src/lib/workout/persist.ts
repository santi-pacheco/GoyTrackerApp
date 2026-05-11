import { v4 as uuid } from 'uuid';
import { persistOrQueueFinishSession } from '@/lib/db/sync';
import type { ActiveSession } from '@/stores/sessionStore';
import type { QueuedSessionPayload } from '@/lib/db/schema';

// Build a deterministic-UUID payload from an ActiveSession + user_id,
// then attempt direct Supabase write — on failure, enqueue for sync.
export async function persistFinishedSession(
  active: ActiveSession,
  userId: string
): Promise<{ queued: boolean; sessionId: string }> {
  const endedAt = new Date().toISOString();
  const sessionId = uuid();

  const exercises: QueuedSessionPayload['exercises'] = [];
  const sets: QueuedSessionPayload['sets'] = [];

  for (let i = 0; i < active.exercises.length; i++) {
    const ex = active.exercises[i];
    const completedSets = ex.sets.filter((s) => s.completed && s.reps > 0);
    if (completedSets.length === 0) continue;
    const seId = uuid();
    exercises.push({
      id: seId,
      session_id: sessionId,
      exercise_id: ex.exercise_id,
      order_index: i,
      notes: ex.notes || null,
    });
    completedSets.forEach((s, idx) => {
      sets.push({
        id: uuid(),
        session_exercise_id: seId,
        set_index: idx + 1,
        reps: s.reps,
        weight_kg: s.weight_kg,
        rpe: s.rpe,
        is_warmup: s.is_warmup,
      });
    });
  }

  const payload: QueuedSessionPayload = {
    session: {
      id: sessionId,
      user_id: userId,
      template_id: active.template_id,
      name: active.name,
      started_at: active.started_at,
      ended_at: endedAt,
    },
    exercises,
    sets,
  };

  const { queued } = await persistOrQueueFinishSession(payload);
  return { queued, sessionId };
}
