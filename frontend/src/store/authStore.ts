import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isOnboarded?: boolean;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: string | null;

  setAuth: (token: string, refreshToken: string | null, user: AuthUser) => void;
  setOnboarded: (isOnboarded: boolean) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  setSessionExpired: (message: string) => void;
  clearSessionExpired: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      sessionExpired: null,
      setAuth: (token, refreshToken, user) => {
        set({ token, refreshToken, user, isAuthenticated: true });
      },
      setOnboarded: (isOnboarded: boolean) => {
        set((state) => ({
          user: state.user ? { ...state.user, isOnboarded } : null,
        }));
      },
      clearAuth: () => {
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false });
      },
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },
      setSessionExpired: (message: string) => {
        set({ sessionExpired: message });
      },
      clearSessionExpired: () => {
        set({ sessionExpired: null });
      },
    }),
    {
      name: 'aegis-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);