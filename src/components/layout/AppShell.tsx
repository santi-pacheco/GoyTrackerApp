import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { RestTimer } from '@/components/workout/RestTimer';

export function AppShell() {
  return (
    <div className="flex min-h-full flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-24 pt-4">
        <Outlet />
      </main>
      <RestTimer />
      <BottomNav />
    </div>
  );
}
