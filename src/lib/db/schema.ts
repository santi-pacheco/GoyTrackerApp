import Dexie, { type Table } from 'dexie';

export type QueuedSessionPayload = {
  session: {
    id: string;
    user_id: string;
    template_id: string | null;
    name: string;
    started_at: string;
    ended_at: string;
  };
  exercises: Array<{
    id: string;
    session_id: string;
    exercise_id: string;
    order_index: number;
    notes: string | null;
  }>;
  sets: Array<{
    id: string;
    session_exercise_id: string;
    set_index: number;
    reps: number;
    weight_kg: number;
    rpe: number | null;
    is_warmup: boolean;
  }>;
};

export type QueueEntry = {
  id?: number;
  kind: 'finish_session';
  payload: QueuedSessionPayload;
  createdAt: number;
  lastError?: string;
};

class GoyTrackerDB extends Dexie {
  queue!: Table<QueueEntry, number>;

  constructor() {
    super('goytracker');
    this.version(1).stores({
      queue: '++id, kind, createdAt',
    });
  }
}

export const db = new GoyTrackerDB();
