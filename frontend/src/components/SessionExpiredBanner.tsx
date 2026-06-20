import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const SessionExpiredBanner = () => {
  const { sessionExpired, clearSessionExpired } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionExpired) {
      // Redirect to login after 3 seconds
      const timer = setTimeout(() => {
        clearSessionExpired();
        navigate('/login', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [sessionExpired, clearSessionExpired, navigate]);

  if (!sessionExpired) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-50 border-b border-red-200 p-4 z-50">
      <div className="max-w-md mx-auto text-center">
        <p className="text-red-600 font-medium">{sessionExpired}</p>
      </div>
    </div>
  );
};