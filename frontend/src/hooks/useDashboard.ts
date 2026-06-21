import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../lib/dashboard.service';
import type { DashboardData } from '../lib/dashboard.types';

export const useDashboard = () => {
  const dashboard = useQuery<DashboardData, Error>({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getDashboardData,
    staleTime: 60000,
  });

  return { dashboard };
};
