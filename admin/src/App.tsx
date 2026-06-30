import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import LoginPage from './pages/LoginPage';
import PendingPage from './pages/PendingPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (user.status === 'pending') {
    return (
      <Routes>
        <Route path="/pending" element={<PendingPage />} />
        <Route path="*" element={<Navigate to="/pending" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          user.role === 'admin' ? (
            <AppShell>
              <DashboardPage />
            </AppShell>
          ) : (
            <Navigate to="/settings" replace />
          )
        }
      />
      <Route
        path="/settings"
        element={
          <AppShell>
            <SettingsPage />
          </AppShell>
        }
      />
      <Route
        path="*"
        element={
          <Navigate to={user.role === 'admin' ? '/dashboard' : '/settings'} replace />
        }
      />
    </Routes>
  );
}
