import api from './api';

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  training_years: number | null;
  primary_goal: string | null;
  experience_level: string | null;
  preferred_units: string;
  timezone: string | null;
  notification_preferences: Record<string, boolean>;
  goals: string[];
  equipment: string[];
  target_days_per_week: number | null;
  weight: number | null;
  weight_unit: string;
  referral_source: string | null;
  onboarding_completed_at: string | null;
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  preferred_units?: string;
  notification_preferences?: Record<string, boolean>;
  goals?: string[];
  equipment?: string[];
  experience_level?: string;
  target_days_per_week?: number;
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },
};

export default profileService;
