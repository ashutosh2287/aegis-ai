import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import type { AuthResponse } from '../lib/authTypes';

export const useLogin = () => {
  const navigate = useNavigate();
  const { setAuth, setLoading } = useAuthStore();

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      // Assuming the response contains token, refreshToken, and user
      const { token, refreshToken, user } = response.data;
      setAuth(token, refreshToken, user);
      navigate('/dashboard'); // Redirect to dashboard after login
    } catch (error: unknown) {
      setLoading(false);
      throw error; // Re-throw for the component to handle
    } finally {
      // setLoading(false); // We'll set in finally if we want to always set loading false
    }
  };

  return { login };
};