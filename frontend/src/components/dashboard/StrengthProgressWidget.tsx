import { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useDashboard } from '../../hooks/useDashboard';
import { CountUp } from '../ui/CountUp';
import { DashboardSectionError } from './DashboardSectionError';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900">
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
  const { historical } = useDashboard();

  const chartData = useMemo(() => {
    if (!historical.data?.dataPoints) return [];

    const eightWeeksAgo = getWeeksAgo(8);
    const filtered = historical.data.dataPoints.filter(
      (dp) => dp.date >= eightWeeksAgo && dp.oneRepMax !== null
    );

    return filtered.map((dp) => ({
      date: new Date(dp.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      oneRepMax: dp.oneRepMax ?? 0,
    }));
  }, [historical.data]);

  if (historical.isError) {
    return (
      <DashboardSectionError
        title="Strength Progress"
        message={historical.error?.message}
        onRetry={() => historical.refetch()}
      />
    );
  }

  if (historical.isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-sm transition-shadow">
        <div className="h-3 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
        <div className="h-[160px] bg-gray-100 rounded-lg animate-pulse" />
        <div className="mt-4 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
        </div>
      </div>
    );
  }

  const current1RM = historical.data?.currentOneRepMax ?? 0;
  const changePercent = historical.data?.oneRepMaxChangePercent ?? 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-sm transition-shadow">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-gray-500 mb-4">
        {historical.data?.exerciseName ?? 'Strength'} — 1RM Trend
      </h3>

      {chartData.length === 0 ? (
        <div className="h-[160px] flex items-center justify-center text-gray-500 text-sm">
          No strength data available yet.
        </div>
      ) : (
        <div className="h-[160px] w-full" role="img" aria-label="Strength progress area chart showing one rep max trend over the last 8 weeks">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="oneRepMaxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="oneRepMax"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#oneRepMaxGradient)"
                dot={{ r: 3, fill: '#6366f1' }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 flex items-baseline gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Current 1RM</p>
          <div className="flex items-baseline gap-1">
            <CountUp
              to={current1RM}
              decimals={1}
              className="text-[24px] font-semibold text-gray-900"
            />
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">kg</span>
          </div>
        </div>
        {changePercent !== 0 && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              changePercent >= 0
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {changePercent >= 0 ? '+' : ''}
            {changePercent.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
};
