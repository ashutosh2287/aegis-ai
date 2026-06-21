import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Dumbbell, Trophy, Target } from 'lucide-react';
import { useComparativeAnalytics } from '../../hooks/useAnalytics';
import { ErrorCard } from '../ui/ErrorCard';
import type { ComparativePeriod, ComparativeAnalytics } from '../../lib/analytics.types';

type StatKey = 'volume' | 'workouts' | 'prs' | 'consistency';

interface StatDef {
  key: StatKey;
  label: string;
  icon: React.ReactNode;
  getValue: (data: ComparativeAnalytics, period: ComparativePeriod) => number;
  getPrevValue: (data: ComparativeAnalytics, period: ComparativePeriod) => number;
  format: (n: number) => string;
}

const stats: StatDef[] = [
  {
    key: 'volume',
    label: 'Volume',
    icon: <BarChart3 className="h-5 w-5" />,
    getValue: (d, p) =>
      p === 'week'
        ? d.workoutVolume.currentWeek.totalVolume
        : d.monthlyVolume.currentMonth.totalVolume,
    getPrevValue: (d, p) =>
      p === 'week'
        ? d.workoutVolume.previousWeek.totalVolume
        : d.monthlyVolume.previousMonth.totalVolume,
    format: (n) => `${n.toLocaleString()} kg`,
  },
  {
    key: 'workouts',
    label: 'Workouts',
    icon: <Dumbbell className="h-5 w-5" />,
    getValue: (d, p) =>
      p === 'week'
        ? d.workoutFrequencyWeekly.currentWeek
        : d.workoutFrequencyMonthly.currentMonth,
    getPrevValue: (d, p) =>
      p === 'week'
        ? d.workoutFrequencyWeekly.previousWeek
        : d.workoutFrequencyMonthly.previousMonth,
    format: (n) => `${n}`,
  },
  {
    key: 'prs',
    label: 'Personal Records',
    icon: <Trophy className="h-5 w-5" />,
    getValue: (d, p) =>
      p === 'week'
        ? d.personalRecordsWeekly.currentWeek
        : d.personalRecordsMonthly.currentMonth,
    getPrevValue: (d, p) =>
      p === 'week'
        ? d.personalRecordsWeekly.previousWeek
        : d.personalRecordsMonthly.previousMonth,
    format: (n) => `${n}`,
  },
  {
    key: 'consistency',
    label: 'Consistency',
    icon: <Target className="h-5 w-5" />,
    getValue: (d) => d.currentConsistency.adherencePercentage,
    getPrevValue: () => 0,
    format: (n) => `${n.toFixed(0)}%`,
  },
];

const StatSkeleton = () => (
  <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5">
    <div className="flex items-center gap-3 mb-3">
      <div className="h-9 w-9 bg-aegis-border rounded-lg animate-pulse" />
      <div className="h-4 bg-aegis-border rounded w-20 animate-pulse" />
    </div>
    <div className="h-8 bg-aegis-border rounded w-24 animate-pulse" />
    <div className="h-3 bg-aegis-dark rounded w-16 mt-2 animate-pulse" />
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6">
    <div className="h-4 bg-aegis-border rounded w-40 mb-6 animate-pulse" />
    <div className="h-[250px] bg-aegis-dark rounded-lg animate-pulse" />
  </div>
);

interface DeltaBadgeProps {
  current: number;
  previous: number;
  period: ComparativePeriod;
}

const DeltaBadge = ({ current, previous, period }: DeltaBadgeProps) => {
  const change =
    previous === 0
      ? current > 0
        ? 100
        : 0
      : ((current - previous) / previous) * 100;
  const isPositive = change >= 0;
  const label = period === 'week' ? 'vs last week' : 'vs last month';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${current}-${previous}-${period}`}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.15 }}
        className="flex items-center gap-1.5 mt-1.5"
      >
        <span
          className={`text-xs font-semibold ${
            isPositive ? 'text-emerald-600' : 'text-red-500'
          }`}
        >
          {isPositive ? '+' : ''}
          {change.toFixed(1)}%
        </span>
        <span className="text-[11px] text-gray-500">{label}</span>
      </motion.div>
    </AnimatePresence>
  );
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-aegis-charcoal border border-aegis-border rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs text-aegis-muted mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm font-medium text-white">
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const formatYAxis = (value: number): string => {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return `${value}`;
};

export const ComparativeAnalyticsSection = () => {
  const [period, setPeriod] = useState<ComparativePeriod>('week');
  const { data, isLoading, isError, error, refetch } = useComparativeAnalytics(period);

  const chartData = useMemo(() => {
    if (!data) return [];

    const current =
      period === 'week' ? data.workoutVolume.currentWeek : data.monthlyVolume.currentMonth;
    const previous =
      period === 'week' ? data.workoutVolume.previousWeek : data.monthlyVolume.previousMonth;

    return [
      {
        name: 'Volume',
        current: current.totalVolume,
        previous: previous.totalVolume,
      },
      {
        name: 'Sets',
        current: current.totalSets,
        previous: previous.totalSets,
      },
      {
        name: 'Reps',
        current: current.totalReps,
        previous: previous.totalReps,
      },
    ];
  }, [data, period]);

  if (isError) {
    return (
      <ErrorCard
        title="Failed to load comparative analytics"
        message={error?.message || 'Could not fetch analytics data.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <div className="flex bg-aegis-dark rounded-lg p-0.5 shrink-0" role="tablist" aria-label="Time period">
          {(['week', 'month'] as const).map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-aegis-gold focus:ring-offset-1 ${
                period === p
                  ? 'bg-aegis-charcoal text-white shadow-sm'
                  : 'text-aegis-muted hover:text-white'
              }`}
            >
              {p === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : stats.map((stat) => {
              const current = data ? stat.getValue(data, period) : 0;
              const previous = data ? stat.getPrevValue(data, period) : 0;

              return (
                <motion.div
                  key={stat.key}
                  layout
                  className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 bg-aegis-gold/10 rounded-lg flex items-center justify-center text-aegis-gold">
                      {stat.icon}
                    </div>
                    <span className="text-sm font-medium text-aegis-muted">{stat.label}</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${stat.key}-${current}-${period}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="text-2xl font-bold text-white"
                    >
                      {stat.format(current)}
                    </motion.div>
                  </AnimatePresence>
                  {stat.key !== 'consistency' && data && (
                    <DeltaBadge
                      current={current}
                      previous={previous}
                      period={period}
                    />
                  )}
                </motion.div>
              );
            })}
      </div>

      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6">
          <h3 className="text-sm font-semibold text-white mb-4">
            Volume Comparison
          </h3>
          <div className="h-[250px] w-full" role="img" aria-label="Bar chart comparing current and previous period volume, sets, and reps">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="30%" barSize={16}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#888888' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12, fill: '#888888' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(212, 168, 67, 0.08)' }} />
                <Bar
                  dataKey="current"
                  name="Current Period"
                  fill="#d4a843"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="previous"
                  name="Previous Period"
                  fill="#2a2a2a"
                  radius={[4, 4, 0, 0]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', lineHeight: '18px' }}
                  formatter={(value: string) => (
                    <span className="text-xs text-aegis-muted">{value}</span>
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
