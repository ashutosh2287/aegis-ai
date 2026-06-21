import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import type { AuthResponse } from '../lib/authTypes';

export const useLogin = () => {
  const navigate = useNavigate();
  const { setAuth, setLoading, setOnboarded } = useAuthStore();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      // Assuming the response contains token, refreshToken, and user
      const { token, refreshToken, user } = response.data;
      setAuth(token, refreshToken, user);

      // Fetch profile to get onboarding status
      try {
        const profileResponse = await api.get('/auth/me');
        const profile = profileResponse.data;
        setOnboarded(!!profile.onboarding_completed_at);
      } catch {
        // If profile fetch fails, proceed to dashboard anyway
      }

      navigate('/app/dashboard'); // Redirect to dashboard after login
    } catch (error: unknown) {
      throw error; // Re-throw for the component to handle
    } finally {
      setLoading(false);
    }
  };

  return { login };
};