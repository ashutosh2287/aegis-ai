import { useDashboard } from '../../hooks/useDashboard';
import { DashboardSectionError } from './DashboardSectionError';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-aegis-charcoal border border-aegis-border rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs text-aegis-muted">{label}</p>
      <p className="text-sm font-semibold text-white">
        {payload[0].value.toLocaleString()} kg
      </p>
    </div>
  );
};

const getWeeksAgo = (weeks: number) => {
  const date = new Date();
  date.setDate(date.getDate() - weeks * 7);
  return date.toISOString().split('T')[0];
};

export const StrengthProgressWidget = () => {
  const { dashboard } = useDashboard();

  if (dashboard.isError) {
    return (
      <DashboardSectionError
        title="Strength Progress"
        message={dashboard.error?.message}
        onRetry={() => dashboard.refetch()}
      />
    );
  }

  if (dashboard.isLoading) {
    return (
      <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4 sm:p-6 hover:shadow-sm transition-shadow">
        <div className="h-3 bg-aegis-border rounded w-40 mb-4 animate-pulse" />
        <div className="h-[160px] bg-aegis-dark rounded-lg animate-pulse" />
        <div className="mt-4 space-y-2">
          <div className="h-3 bg-aegis-border rounded w-24 animate-pulse" />
          <div className="h-5 bg-aegis-border rounded w-16 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4 sm:p-6 hover:shadow-sm transition-shadow">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted mb-4">
        Strength Progress — 1RM Trend
      </h3>

      <div className="h-[160px] flex items-center justify-center text-aegis-muted text-sm">
        Exercise progression data not available from current API.
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">Personal Records</p>
          <div className="flex items-baseline gap-1">
            <span className="text-[24px] font-semibold text-white">
              {dashboard.data?.personalRecords.length ?? 0}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">total</span>
          </div>
        </div>
      </div>
    </div>
  );
};
