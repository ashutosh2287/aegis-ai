import { type ReactElement } from 'react';
import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

interface AuthProtectedRouteProps {
  children: ReactElement;
}

const AuthProtectedRoute = ({ children }: AuthProtectedRouteProps): ReactElement => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthProtectedRoute;