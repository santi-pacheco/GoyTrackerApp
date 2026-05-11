import { create } from 'zustand';

type State = {
  endsAt: number | null;
  totalSeconds: number;
  exerciseName: string;
};

type Actions = {
  start: (seconds: number, exerciseName: string) => void;
  stop: () => void;
  addSeconds: (delta: number) => void;
};

export const useTimerStore = create<State & Actions>((set) => ({
  endsAt: null,
  totalSeconds: 0,
  exerciseName: '',

  start: (seconds, exerciseName) =>
    set({
      endsAt: Date.now() + seconds * 1000,
      totalSeconds: seconds,
      exerciseName,
    }),

  stop: () => set({ endsAt: null, totalSeconds: 0, exerciseName: '' }),

  addSeconds: (delta) =>
    set((s) =>
      s.endsAt
        ? { endsAt: s.endsAt + delta * 1000, totalSeconds: s.totalSeconds + delta }
        : s
    ),
}));
