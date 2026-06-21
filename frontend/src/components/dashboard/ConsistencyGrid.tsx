import { useDashboard } from '../../hooks/useDashboard';
import { DashboardSectionError } from './DashboardSectionError';

const TRAINED_COLOR = '#1D9E75';
const REST_COLOR = 'transparent';
const BORDER_COLOR = '#2a2a2a';

export const ConsistencyGrid = () => {
  const { dashboard } = useDashboard();

  if (dashboard.isError) {
    return (
      <DashboardSectionError
        title="Consistency Grid"
        message={dashboard.error?.message}
        onRetry={() => dashboard.refetch()}
      />
    );
  }

  if (dashboard.isLoading) {
    return (
      <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6 hover:shadow-sm transition-shadow">
        <div className="h-3 bg-aegis-border rounded w-32 mb-4 animate-pulse" />
        <div className="h-[200px] bg-aegis-dark rounded-lg animate-pulse" />
        <div className="mt-4 flex gap-8">
          <div className="h-3 bg-aegis-border rounded w-24 animate-pulse" />
          <div className="h-3 bg-aegis-border rounded w-24 animate-pulse" />
        </div>
      </div>
    );
  }

  const data = dashboard.data;
  const adherencePercentage = data?.workoutConsistency.adherencePercentage ?? 0;
  const bestStreak = data?.workoutConsistency.longestStreak ?? 0;

  return (
    <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6 hover:shadow-sm transition-shadow">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted mb-4">Consistency</h3>

      <div className="overflow-x-auto -mx-2 px-2">
        <div className="h-[200px] flex items-center justify-center text-aegis-muted text-sm">
          Heatmap data not available from current API.
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-8">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">Adherence: </span>
          <span className="text-[24px] font-semibold text-white">
            {adherencePercentage.toFixed(0)}%
          </span>
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">Best Streak: </span>
          <span className="text-[24px] font-semibold text-white">
            {bestStreak} days
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div
            className="rounded-sm"
            style={{
              width: 10,
              height: 10,
              backgroundColor: REST_COLOR,
              border: `1px solid ${BORDER_COLOR}`,
            }}
          />
          <span className="text-xs text-aegis-muted">Rest</span>
          <div
            className="rounded-sm"
            style={{
              width: 10,
              height: 10,
              backgroundColor: TRAINED_COLOR,
            }}
          />
          <span className="text-xs text-aegis-muted">Trained</span>
        </div>
      </div>
    </div>
  );
};
