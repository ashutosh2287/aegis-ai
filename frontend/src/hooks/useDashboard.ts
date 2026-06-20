import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../lib/dashboard.service';
import type {
  DashboardOverview,
  DashboardPerformance,
  DashboardHistorical,
  DashboardKPIs,
} from '../lib/dashboard.types';

export const useDashboard = () => {
  const overview = useQuery<DashboardOverview, Error>({
    queryKey: ['dashboard', 'overview'],
    queryFn: dashboardService.getOverview,
    staleTime: 60000,
  });

  const performance = useQuery<DashboardPerformance, Error>({
    queryKey: ['dashboard', 'performance'],
    queryFn: dashboardService.getPerformance,
  });

  const historical = useQuery<DashboardHistorical, Error>({
    queryKey: ['dashboard', 'historical'],
    queryFn: dashboardService.getHistorical,
  });

  const kpis = useQuery<DashboardKPIs, Error>({
    queryKey: ['dashboard', 'kpis'],
    queryFn: dashboardService.getKPIs,
  });

  return {
    overview,
    performance,
    historical,
    kpis,
  };
};
