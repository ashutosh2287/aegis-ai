import { type ReactElement } from 'react';
import { useAuthStore } from '../store/authStore';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthProtectedRouteProps {
  children: ReactElement;
}

const AuthProtectedRoute = ({ children }: AuthProtectedRouteProps): ReactElement => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user already completed onboarding, never let them see /onboarding again
  if (user?.isOnboarded && location.pathname === '/onboarding') {
    return <Navigate to="/app/dashboard" replace />;
  }

  // If user is authenticated but hasn't completed onboarding, redirect to onboarding
  // (but not if we're already on /onboarding to avoid infinite loop)
  if (user && user.isOnboarded === false && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default AuthProtectedRoute;