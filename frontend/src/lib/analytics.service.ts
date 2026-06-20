import api from './api';
import type {
  ComparativeAnalytics,
  ComparativePeriod,
  PlateauDetection,
  Recommendation,
  PersonalRecord,
} from './analytics.types';

export const analyticsService = {
  async getComparative(period: ComparativePeriod): Promise<ComparativeAnalytics> {
    const response = await api.get('/analytics/comparative', {
      params: { period },
    });
    return response.data;
  },

  async getPlateauDetection(periodDays?: number): Promise<PlateauDetection> {
    const response = await api.get('/analytics/plateau-detection', {
      params: periodDays !== undefined ? { periodDays } : undefined,
    });
    return response.data;
  },

  async getRecommendations(): Promise<Recommendation[]> {
    const response = await api.get('/analytics/recommendations');
    return response.data;
  },

  async getPersonalRecords(): Promise<PersonalRecord[]> {
    const response = await api.get('/analytics/prs');
    return response.data;
  },
};

export default analyticsService;
