import { useEffect } from 'react';
import { flushQueue, pendingCount } from '@/lib/db/sync';
import { useSyncStore } from '@/stores/syncStore';

const POLL_MS = 30_000;

export function useSyncEngine() {
  const setOnline = useSyncStore((s) => s.setOnline);
  const setPending = useSyncStore((s) => s.setPending);
  const setSyncing = useSyncStore((s) => s.setSyncing);

  useEffect(() => {
    let stopped = false;

    async function refreshPending() {
      const n = await pendingCount();
      if (!stopped) setPending(n);
    }

    async function tryFlush() {
      if (!navigator.onLine) return;
      setSyncing(true);
      try {
        await flushQueue();
        await refreshPending();
      } finally {
        if (!stopped) setSyncing(false);
      }
    }

    function handleOnline() {
      setOnline(true);
      void tryFlush();
    }
    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    void refreshPending();
    void tryFlush();
    const id = setInterval(() => void tryFlush(), POLL_MS);

    return () => {
      stopped = true;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(id);
    };
  }, [setOnline, setPending, setSyncing]);
}
