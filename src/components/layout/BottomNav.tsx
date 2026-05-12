import { NavLink } from 'react-router-dom';
import { Dumbbell, BookOpen, Calendar, LineChart, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/', icon: Dumbbell, label: 'Workout' },
  { to: '/library', icon: BookOpen, label: 'Library' },
  { to: '/history', icon: Calendar, label: 'History' },
  { to: '/analytics', icon: LineChart, label: 'Analytics' },
  { to: '/leaderboard', icon: Trophy, label: 'Compete' },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md justify-around">
        {items.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-3 py-2 text-xs',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
