import { Dumbbell, Weight, TrendingUp, Flame } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { CountUp } from '../ui/CountUp';
import { DashboardSectionError } from './DashboardSectionError';

interface SummaryCardProps {
  title: string;
  value: number;
  decimals?: number;
  suffix?: string;
  icon: React.ReactNode;
  delta?: number;
  deltaLabel?: string;
  isLoading?: boolean;
}

const SummaryCard = ({
  title,
  value,
  decimals = 0,
  suffix = '',
  icon,
  delta,
  deltaLabel,
  isLoading,
}: SummaryCardProps) => {
  if (isLoading) {
    return (
      <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-3 bg-aegis-border rounded w-24 animate-pulse" />
            <div className="h-7 bg-aegis-border rounded w-20 animate-pulse" />
          </div>
          <div className="h-12 w-12 bg-aegis-border rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">{title}</p>
          <div className="flex items-baseline gap-1">
            <CountUp
              to={value}
              decimals={decimals}
              className="text-[24px] font-semibold text-white"
            />
            {suffix && (
              <span className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">{suffix}</span>
            )}
          </div>
          {delta !== undefined && deltaLabel && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-[11px] font-semibold ${
                  delta >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {delta >= 0 ? '+' : ''}
                {delta.toFixed(0)}%
              </span>
              <span className="text-[11px] text-aegis-muted">{deltaLabel}</span>
            </div>
          )}
        </div>
        <div className="h-12 w-12 bg-aegis-gold/10 rounded-full flex items-center justify-center text-aegis-gold">
          {icon}
        </div>
      </div>
    </div>
  );
};

export const DashboardSummaryCards = () => {
  const { dashboard } = useDashboard();

  const isLoading = dashboard.isLoading;
  const hasError = dashboard.isError;

  if (hasError) {
    return (
      <DashboardSectionError
        title="Summary Cards"
        message={dashboard.error?.message}
        onRetry={() => dashboard.refetch()}
      />
    );
  }

  const data = dashboard.data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Total Workouts"
        value={data?.workoutConsistency.totalWorkoutDays ?? 0}
        icon={<Dumbbell className="h-6 w-6" />}
        isLoading={isLoading}
      />
      <SummaryCard
        title="Total Volume"
        value={data?.weeklyVolume.totalVolume ?? 0}
        suffix="kg"
        icon={<Weight className="h-6 w-6" />}
        isLoading={isLoading}
      />
      <SummaryCard
        title="Weekly Volume"
        value={data?.weeklyVolume.totalVolume ?? 0}
        suffix="kg"
        icon={<TrendingUp className="h-6 w-6" />}
        isLoading={isLoading}
      />
      <SummaryCard
        title="Current Streak"
        value={data?.workoutConsistency.currentStreak ?? 0}
        suffix="days"
        icon={<Flame className="h-6 w-6" />}
        isLoading={isLoading}
      />
    </div>
  );
};
