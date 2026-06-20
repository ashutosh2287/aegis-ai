import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import { AppShell } from '../layouts/AppShell';
import AuthProtectedRoute from '../components/AuthProtectedRoute';
// Placeholder pages - we'll create them later
import DashboardPage from '../pages/DashboardPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import RecordsPage from '../pages/RecordsPage';
import WorkoutsPage from '../pages/WorkoutsPage';
import HistoryPage from '../pages/HistoryPage';
import InsightsPage from '../pages/InsightsPage';
import GoalsPage from '../pages/GoalsPage';
import ProfilePage from '../pages/ProfilePage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/app',
    element: (
      <AuthProtectedRoute>
        <AppShell />
      </AuthProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'records', element: <RecordsPage /> },
      { path: 'workouts', element: <WorkoutsPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'insights', element: <InsightsPage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
]);

export default router;