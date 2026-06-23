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
      const { token, refreshToken, user } = response.data;
      setAuth(token, refreshToken, user);

      // Fetch profile to get onboarding status
      try {
        const profileResponse = await api.get('/auth/me');
        const profile = profileResponse.data;
        const isOnboarded = !!profile.onboarding_completed_at;
        setOnboarded(isOnboarded);
        useAuthStore.setState((state) => ({
          user: state.user
            ? {
                ...state.user,
                isOnboarded,
                goals: profile.goals ?? [],
                equipment: profile.equipment ?? [],
                experienceLevel: profile.experience_level ?? null,
                targetDaysPerWeek: profile.target_days_per_week ?? null,
              }
            : null,
        }));

        // Redirect based on actual onboarding status
        if (isOnboarded) {
          navigate('/app/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } catch {
        // Profile fetch failed — go to dashboard (will be caught by route guard)
        navigate('/app/dashboard', { replace: true });
      }
    } catch (error: unknown) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { login };
};