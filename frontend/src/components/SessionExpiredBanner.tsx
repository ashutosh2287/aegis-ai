import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const SessionExpiredBanner = () => {
  const { sessionExpired, clearSessionExpired } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (sessionExpired && location.pathname !== '/login') {
      const timer = setTimeout(() => {
        clearSessionExpired();
        navigate('/login', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
    // If on login page, just clear the message silently
    if (sessionExpired && location.pathname === '/login') {
      clearSessionExpired();
    }
  }, [sessionExpired, clearSessionExpired, navigate, location.pathname]);

  if (!sessionExpired) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-50 border-b border-red-200 p-4 z-50">
      <div className="max-w-md mx-auto text-center">
        <p className="text-red-600 font-medium">{sessionExpired}</p>
      </div>
    </div>
  );
};