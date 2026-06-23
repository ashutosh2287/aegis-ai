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
    const response = await api.get('/analytics/goals', {
      params: { goalId },
    });
    return response.data;
  },

  async getStrengthForecast(): Promise<ForecastHistoryPoint[]> {
    const response = await api.get('/analytics/projection/strength');
    return response.data;
  },

  async getVolumeForecast(): Promise<ForecastHistoryPoint[]> {
    const response = await api.get('/analytics/projection/volume');
    return response.data;
  },

  async getFrequencyForecast(): Promise<ForecastHistoryPoint[]> {
    const response = await api.get('/analytics/projection/frequency');
    return response.data;
  },

  async getForecastRecommendations(): Promise<ForecastRecommendation[]> {
    const response = await api.get('/analytics/projection/recommendations');
    return response.data;
  },
};

export default goalsService;
