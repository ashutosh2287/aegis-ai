import api from './api';
import type {
  DashboardOverview,
  DashboardPerformance,
  DashboardHistorical,
  DashboardKPIs,
} from './dashboard.types';

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const response = await api.get('/analytics/dashboard/overview');
    return response.data;
  },

  async getPerformance(): Promise<DashboardPerformance> {
    const response = await api.get('/analytics/dashboard/performance');
    return response.data;
  },

  async getHistorical(): Promise<DashboardHistorical> {
    const response = await api.get('/analytics/dashboard/historical');
    return response.data;
  },

  async getKPIs(): Promise<DashboardKPIs> {
    const response = await api.get('/analytics/dashboard/kpis');
    return response.data;
  },
};

export default dashboardService;
