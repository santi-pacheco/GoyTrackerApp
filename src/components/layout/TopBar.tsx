import { useAuth, signOut } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { useSyncStore } from '@/stores/syncStore';
import { cn } from '@/lib/utils';

export function TopBar() {
  const { user } = useAuth();
  const online = useSyncStore((s) => s.online);
  const pending = useSyncStore((s) => s.pending);
  const syncing = useSyncStore((s) => s.syncing);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold tracking-tight">GoyTracker</h1>
        <div className="flex items-center gap-2">
          <SyncBadge online={online} pending={pending} syncing={syncing} />
          {user && (
            <Button variant="ghost" size="icon" onClick={() => void signOut()} title="Cerrar sesión">
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function SyncBadge({
  online,
  pending,
  syncing,
}: {
  online: boolean;
  pending: number;
  syncing: boolean;
}) {
  if (syncing) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <RefreshCw className="h-3 w-3 animate-spin" />
        Sync…
      </span>
    );
  }
  if (!online) {
    return (
      <span className={cn('flex items-center gap-1 text-xs', pending > 0 ? 'text-amber-500' : 'text-muted-foreground')}>
        <CloudOff className="h-3 w-3" />
        Offline{pending > 0 ? ` · ${pending} pend.` : ''}
      </span>
    );
  }
  if (pending > 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-500">
        <Cloud className="h-3 w-3" />
        {pending} pend.
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-emerald-500">
      <Cloud className="h-3 w-3" />
      Sync
    </span>
  );
}
