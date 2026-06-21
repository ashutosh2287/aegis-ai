import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import type { AuthResponse } from '../lib/authTypes';

export const useRegister = () => {
  const navigate = useNavigate();
  const { setAuth, setLoading } = useAuthStore();

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/signup', { firstName, lastName, email, password });
      // Assuming the response contains token, refreshToken, and user
      const { token, refreshToken, user } = response.data;
      setAuth(token, refreshToken, user);
      navigate('/app/dashboard'); // Redirect to dashboard after registration
    } catch (error: unknown) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { register };
};