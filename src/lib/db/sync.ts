import { supabase } from '@/lib/supabase';
import { db, type QueueEntry, type QueuedSessionPayload } from './schema';

// Try to push a single queued session to Supabase.
// Uses upsert so retries are idempotent (deterministic UUIDs assigned at enqueue time).
async function pushFinishSession(payload: QueuedSessionPayload): Promise<void> {
  const { error: sErr } = await supabase
    .from('workout_sessions')
    .upsert(payload.session, { onConflict: 'id' });
  if (sErr) throw new Error(`session: ${sErr.message}`);

  if (payload.exercises.length > 0) {
    const { error: eErr } = await supabase
      .from('session_exercises')
      .upsert(payload.exercises, { onConflict: 'id' });
    if (eErr) throw new Error(`session_exercises: ${eErr.message}`);
  }

  if (payload.sets.length > 0) {
    const { error: setsErr } = await supabase
      .from('sets')
      .upsert(payload.sets, { onConflict: 'id' });
    if (setsErr) throw new Error(`sets: ${setsErr.message}`);
  }
}

// Enqueue a finished session payload for later sync.
export async function enqueueFinishSession(payload: QueuedSessionPayload): Promise<number> {
  return await db.queue.add({
    kind: 'finish_session',
    payload,
    createdAt: Date.now(),
  });
}

// Attempt to flush all queued entries. Returns counts.
export async function flushQueue(): Promise<{ flushed: number; remaining: number; errors: string[] }> {
  const entries: QueueEntry[] = await db.queue.orderBy('createdAt').toArray();
  let flushed = 0;
  const errors: string[] = [];
  for (const entry of entries) {
    if (entry.id == null) continue;
    try {
      if (entry.kind === 'finish_session') {
        await pushFinishSession(entry.payload);
      }
      await db.queue.delete(entry.id);
      flushed++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(msg);
      await db.queue.update(entry.id, { lastError: msg });
      break; // stop on first failure (likely offline)
    }
  }
  const remaining = await db.queue.count();
  return { flushed, remaining, errors };
}

export async function pendingCount(): Promise<number> {
  return await db.queue.count();
}

// Try Supabase first; on failure, enqueue for later.
export async function persistOrQueueFinishSession(
  payload: QueuedSessionPayload
): Promise<{ queued: boolean }> {
  if (navigator.onLine) {
    try {
      await pushFinishSession(payload);
      return { queued: false };
    } catch {
      /* fall through to enqueue */
    }
  }
  await enqueueFinishSession(payload);
  return { queued: true };
}
