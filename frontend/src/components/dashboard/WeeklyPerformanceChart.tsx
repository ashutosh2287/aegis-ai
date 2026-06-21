import { useDashboard } from '../../hooks/useDashboard';
import { DashboardSectionError } from './DashboardSectionError';

export const WeeklyPerformanceChart = () => {
  const { dashboard } = useDashboard();

  if (dashboard.isError) {
    return (
      <DashboardSectionError
        title="Weekly Performance"
        message={dashboard.error?.message}
        onRetry={() => dashboard.refetch()}
      />
    );
  }

  if (dashboard.isLoading) {
    return (
      <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4 sm:p-6 hover:shadow-sm transition-shadow">
        <div className="h-3 bg-aegis-border rounded w-32 mb-4 animate-pulse" />
        <div className="h-[160px] bg-aegis-dark rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4 sm:p-6 hover:shadow-sm transition-shadow">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted mb-4">Weekly Volume</h3>
      <div className="h-[160px] flex items-center justify-center text-aegis-muted text-sm">
        Daily volume data not available from current API.
      </div>
      <div className="mt-4 flex items-baseline gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">This Week</p>
          <div className="flex items-baseline gap-1">
            <span className="text-[24px] font-semibold text-white">
              {(dashboard.data?.weeklyVolume.totalVolume ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">kg</span>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">Last Month</p>
          <div className="flex items-baseline gap-1">
            <span className="text-[24px] font-semibold text-white">
              {(dashboard.data?.monthlyVolume.totalVolume ?? 0).toLocaleString()}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">kg</span>
          </div>
        </div>
      </div>
    </div>
  );
};
