import api from './api';
import type { DashboardData } from './dashboard.types';

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },
};

export default dashboardService;
