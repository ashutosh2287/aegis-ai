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
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-baseline gap-1">
            <CountUp
              to={value}
              decimals={decimals}
              className="text-3xl font-bold text-gray-900"
            />
            {suffix && (
              <span className="text-sm font-medium text-gray-500">{suffix}</span>
            )}
          </div>
          {delta !== undefined && deltaLabel && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-sm font-medium ${
                  delta >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {delta >= 0 ? '+' : ''}
                {delta.toFixed(0)}%
              </span>
              <span className="text-xs text-gray-500">{deltaLabel}</span>
            </div>
          )}
        </div>
        <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
};

export const DashboardSummaryCards = () => {
  const { overview, kpis } = useDashboard();

  const isLoading = overview.isLoading || kpis.isLoading;
  const hasError = overview.isError || kpis.isError;

  if (hasError) {
    const errorMessage = overview.error?.message || kpis.error?.message;
    return (
      <DashboardSectionError
        title="Summary Cards"
        message={errorMessage}
        onRetry={() => {
          overview.refetch();
          kpis.refetch();
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Total Workouts"
        value={overview.data?.totalWorkouts ?? 0}
        icon={<Dumbbell className="h-6 w-6" />}
        isLoading={isLoading}
      />
      <SummaryCard
        title="Total Volume"
        value={overview.data?.totalVolume ?? 0}
        suffix="kg"
        icon={<Weight className="h-6 w-6" />}
        isLoading={isLoading}
      />
      <SummaryCard
        title="Weekly Volume"
        value={kpis.data?.totalVolumeThisWeek ?? 0}
        suffix="kg"
        icon={<TrendingUp className="h-6 w-6" />}
        delta={kpis.data?.volumeChangePercent}
        deltaLabel="vs last week"
        isLoading={isLoading}
      />
      <SummaryCard
        title="Current Streak"
        value={overview.data?.currentStreak ?? 0}
        suffix="days"
        icon={<Flame className="h-6 w-6" />}
        isLoading={isLoading}
      />
    </div>
  );
};
