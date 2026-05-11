import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';

export type ActiveSet = {
  id: string;
  reps: number;
  weight_kg: number;
  rpe: number | null;
  is_warmup: boolean;
  completed: boolean;
};

export type ActiveExercise = {
  id: string;
  exercise_id: string;
  exercise_name: string;
  rest_seconds: number;
  notes: string;
  sets: ActiveSet[];
};

export type ActiveSession = {
  id: string;
  started_at: string;
  template_id: string | null;
  name: string;
  exercises: ActiveExercise[];
};

type State = {
  active: ActiveSession | null;
};

type Actions = {
  start: (init?: Partial<ActiveSession>) => void;
  end: () => void;
  cancel: () => void;
  rename: (name: string) => void;
  addExercise: (e: { exercise_id: string; exercise_name: string; rest_seconds?: number }) => void;
  removeExercise: (id: string) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (exerciseId: string, setId: string, patch: Partial<ActiveSet>) => void;
  toggleSetComplete: (exerciseId: string, setId: string) => void;
};

export const useSessionStore = create<State & Actions>()(
  persist(
    (set) => ({
      active: null,

      start: (init) =>
        set(() => ({
          active: {
            id: uuid(),
            started_at: new Date().toISOString(),
            template_id: init?.template_id ?? null,
            name: init?.name ?? 'Workout',
            exercises: init?.exercises ?? [],
          },
        })),

      end: () => set(() => ({ active: null })),
      cancel: () => set(() => ({ active: null })),

      rename: (name) =>
        set((s) => (s.active ? { active: { ...s.active, name } } : s)),

      addExercise: ({ exercise_id, exercise_name, rest_seconds }) =>
        set((s) => {
          if (!s.active) return s;
          const newEx: ActiveExercise = {
            id: uuid(),
            exercise_id,
            exercise_name,
            rest_seconds: rest_seconds ?? 90,
            notes: '',
            sets: [
              {
                id: uuid(),
                reps: 0,
                weight_kg: 0,
                rpe: null,
                is_warmup: false,
                completed: false,
              },
            ],
          };
          return { active: { ...s.active, exercises: [...s.active.exercises, newEx] } };
        }),

      removeExercise: (id) =>
        set((s) => {
          if (!s.active) return s;
          return {
            active: { ...s.active, exercises: s.active.exercises.filter((e) => e.id !== id) },
          };
        }),

      addSet: (exerciseId) =>
        set((s) => {
          if (!s.active) return s;
          return {
            active: {
              ...s.active,
              exercises: s.active.exercises.map((e) => {
                if (e.id !== exerciseId) return e;
                const last = e.sets[e.sets.length - 1];
                const next: ActiveSet = {
                  id: uuid(),
                  reps: last?.reps ?? 0,
                  weight_kg: last?.weight_kg ?? 0,
                  rpe: null,
                  is_warmup: false,
                  completed: false,
                };
                return { ...e, sets: [...e.sets, next] };
              }),
            },
          };
        }),

      removeSet: (exerciseId, setId) =>
        set((s) => {
          if (!s.active) return s;
          return {
            active: {
              ...s.active,
              exercises: s.active.exercises.map((e) =>
                e.id === exerciseId ? { ...e, sets: e.sets.filter((set) => set.id !== setId) } : e
              ),
            },
          };
        }),

      updateSet: (exerciseId, setId, patch) =>
        set((s) => {
          if (!s.active) return s;
          return {
            active: {
              ...s.active,
              exercises: s.active.exercises.map((e) =>
                e.id === exerciseId
                  ? {
                      ...e,
                      sets: e.sets.map((st) => (st.id === setId ? { ...st, ...patch } : st)),
                    }
                  : e
              ),
            },
          };
        }),

      toggleSetComplete: (exerciseId, setId) =>
        set((s) => {
          if (!s.active) return s;
          return {
            active: {
              ...s.active,
              exercises: s.active.exercises.map((e) =>
                e.id === exerciseId
                  ? {
                      ...e,
                      sets: e.sets.map((st) =>
                        st.id === setId ? { ...st, completed: !st.completed } : st
                      ),
                    }
                  : e
              ),
            },
          };
        }),
    }),
    { name: 'goytracker.activeSession' }
  )
);
