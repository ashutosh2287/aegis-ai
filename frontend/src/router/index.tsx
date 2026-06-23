import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import { AppShell } from '../layouts/AppShell';
import AuthProtectedRoute from '../components/AuthProtectedRoute';
import { SuspenseWrapper } from '../components/ui/SuspenseWrapper';
import {
  DashboardPage,
  AnalyticsPage,
  RecordsPage,
  WorkoutsPage,
  HistoryPage,
  InsightsPage,
  GoalsPage,
  ProfilePage,
  WorkoutBuilderPage,
  ActiveSessionPage,
  SessionSummaryPage,
  ExerciseCatalogPage,
  OnboardingPage,
  AIChatPage,
  WorkoutGeneratorPage,
  NutritionPlannerPage,
  ProgressAnalysisPage,
  AIInsightsPage,
} from './lazyRoutes';

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
    path: '/onboarding',
    element: (
      <AuthProtectedRoute>
        <SuspenseWrapper>
          <OnboardingPage />
        </SuspenseWrapper>
      </AuthProtectedRoute>
    ),
  },
  {
    path: '/app',
    element: (
      <AuthProtectedRoute>
        <AppShell />
      </AuthProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <SuspenseWrapper><DashboardPage /></SuspenseWrapper> },
      { path: 'analytics', element: <SuspenseWrapper><AnalyticsPage /></SuspenseWrapper> },
      { path: 'records', element: <SuspenseWrapper><RecordsPage /></SuspenseWrapper> },
      { path: 'workouts', element: <SuspenseWrapper><WorkoutsPage /></SuspenseWrapper> },
      { path: 'history', element: <SuspenseWrapper><HistoryPage /></SuspenseWrapper> },
      { path: 'insights', element: <SuspenseWrapper><InsightsPage /></SuspenseWrapper> },
      { path: 'goals', element: <SuspenseWrapper><GoalsPage /></SuspenseWrapper> },
      { path: 'profile', element: <SuspenseWrapper><ProfilePage /></SuspenseWrapper> },
      { path: 'workout-builder', element: <SuspenseWrapper><WorkoutBuilderPage /></SuspenseWrapper> },
      { path: 'exercises', element: <SuspenseWrapper><ExerciseCatalogPage /></SuspenseWrapper> },
      { path: 'session/:sessionId', element: <SuspenseWrapper><ActiveSessionPage /></SuspenseWrapper> },
      { path: 'session-summary/:sessionId', element: <SuspenseWrapper><SessionSummaryPage /></SuspenseWrapper> },
      { path: 'ai/chat', element: <SuspenseWrapper><AIChatPage /></SuspenseWrapper> },
      { path: 'ai/workout', element: <SuspenseWrapper><WorkoutGeneratorPage /></SuspenseWrapper> },
      { path: 'ai/nutrition', element: <SuspenseWrapper><NutritionPlannerPage /></SuspenseWrapper> },
      { path: 'ai/analysis', element: <SuspenseWrapper><ProgressAnalysisPage /></SuspenseWrapper> },
      { path: 'ai/insights', element: <SuspenseWrapper><AIInsightsPage /></SuspenseWrapper> },
    ],
  },
]);

export default router;
