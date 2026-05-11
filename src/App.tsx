import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthState } from '@/hooks/useAuth';
import { useSyncEngine } from '@/hooks/useSync';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import Login from '@/routes/auth/Login';
import Signup from '@/routes/auth/Signup';
import ActiveSession from '@/routes/workout/ActiveSession';
import Library from '@/routes/library/Library';
import CalendarView from '@/routes/history/CalendarView';
import SessionDetail from '@/routes/history/SessionDetail';
import Dashboard from '@/routes/analytics/Dashboard';
import Profile from '@/routes/settings/Profile';

export default function App() {
  const auth = useAuthState();
  useSyncEngine();
  return (
    <AuthProvider value={auth}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<ActiveSession />} />
          <Route path="/library" element={<Library />} />
          <Route path="/history" element={<CalendarView />} />
          <Route path="/history/:id" element={<SessionDetail />} />
          <Route path="/analytics" element={<Dashboard />} />
          <Route path="/settings" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
