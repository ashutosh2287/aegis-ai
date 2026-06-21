import api from './api';
import type {
  GoalProjection,
  ForecastHistoryPoint,
  ForecastRecommendation,
} from './goals.types';

export const goalsService = {
  async getGoals(): Promise<GoalProjection[]> {
    const response = await api.get('/analytics/goals');
    return response.data;
  },

  async getGoalProjection(goalId: string): Promise<GoalProjection> {
    const response = await api.get('/analytics/goal-projection', {
      params: { goalId },
    });
    return response.data;
  },

  async getStrengthForecast(): Promise<ForecastHistoryPoint[]> {
    const response = await api.get('/analytics/strength-forecast');
    return response.data;
  },

  async getVolumeForecast(): Promise<ForecastHistoryPoint[]> {
    const response = await api.get('/analytics/volume-forecast');
    return response.data;
  },

  async getFrequencyForecast(): Promise<ForecastHistoryPoint[]> {
    const response = await api.get('/analytics/frequency-forecast');
    return response.data;
  },

  async getForecastRecommendations(): Promise<ForecastRecommendation[]> {
    const response = await api.get('/analytics/forecast-recommendations');
    return response.data;
  },
};

export default goalsService;
