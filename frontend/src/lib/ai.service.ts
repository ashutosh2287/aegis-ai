import api from './api';
import type {
  ChatMessage,
  ChatResponse,
  WorkoutPlanResponse,
  NutritionPlanResponse,
  AnalysisResponse,
  HealthResponse,
} from './ai.types';

export const aiService = {
  async chat(message: string, history: ChatMessage[] = []): Promise<ChatResponse> {
    const response = await api.post('/ai/chat', { message, history });
    return response.data;
  },

  async generateWorkout(params?: {
    goal?: string;
    daysPerWeek?: number;
    focusAreas?: string[];
    notes?: string;
    durationMinutes?: number;
  }): Promise<WorkoutPlanResponse> {
    const response = await api.post('/ai/workout', params || {});
    return response.data;
  },

  async generateNutrition(params?: {
    dietaryPreference?: string;
    weight?: number;
    activityLevel?: string;
    restrictions?: string;
    mealsPerDay?: number;
  }): Promise<NutritionPlanResponse> {
    const response = await api.post('/ai/nutrition', params || {});
    return response.data;
  },

  async analyzeProgress(params?: {
    period?: string;
    focus?: string;
  }): Promise<AnalysisResponse> {
    const response = await api.post('/ai/analyze', params || {});
    return response.data;
  },

  async getHealth(): Promise<HealthResponse> {
    const response = await api.get('/ai/health');
    return response.data;
  },
};
