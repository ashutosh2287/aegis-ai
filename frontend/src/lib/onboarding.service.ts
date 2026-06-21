import api from './api';
import type { ExperienceLevel, WeightUnit } from './goals.types';

export interface OnboardingData {
  goals: string[];
  equipment: string[];
  experience_level: ExperienceLevel;
  target_days_per_week?: number;
  weight?: number;
  weight_unit: WeightUnit;
  referral_source?: string;
}

export interface OnboardingResponse {
  id: string;
  goals: string[];
  equipment: string[];
  experience_level: string;
  target_days_per_week: number | null;
  weight: number | null;
  weight_unit: string;
  referral_source: string | null;
  onboarding_completed_at: string;
  is_onboarded: boolean;
}

export const onboardingService = {
  async completeOnboarding(data: OnboardingData): Promise<OnboardingResponse> {
    const response = await api.post('/auth/onboarding', data);
    return response.data;
  },

  async getProfile(): Promise<OnboardingResponse> {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default onboardingService;
