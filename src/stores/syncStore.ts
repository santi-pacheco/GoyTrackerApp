import { create } from 'zustand';

type State = {
  online: boolean;
  pending: number;
  syncing: boolean;
};

type Actions = {
  setOnline: (v: boolean) => void;
  setPending: (n: number) => void;
  setSyncing: (v: boolean) => void;
};

export const useSyncStore = create<State & Actions>((set) => ({
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pending: 0,
  syncing: false,
  setOnline: (online) => set({ online }),
  setPending: (pending) => set({ pending }),
  setSyncing: (syncing) => set({ syncing }),
}));
