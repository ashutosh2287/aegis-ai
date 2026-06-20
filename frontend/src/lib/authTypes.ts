import type { AuthUser } from '../store/authStore';

export interface AuthResponse {
  token: string;
  refreshToken: string | null;
  user: AuthUser;
}