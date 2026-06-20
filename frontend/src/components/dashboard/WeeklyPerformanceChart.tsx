import { useMemo } from 'react';
import {
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ResponsiveContainer,
} from 'recharts';
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
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900">
        {payload[0].value.toLocaleString()} kg
      </p>
    </div>
  );
};

const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
    });
  }
  return days;
};

export const WeeklyPerformanceChart = () => {
  const { performance } = useDashboard();

  const chartData = useMemo(() => {
    const last7Days = getLast7Days();
    const dataPointsMap = new Map(
      performance.data?.dataPoints.map((dp) => [dp.date, dp.totalVolume]) ?? []
    );

    return last7Days.map((day) => ({
      day: day.day,
      volume: dataPointsMap.get(day.date) ?? 0,
    }));
  }, [performance.data]);

  if (performance.isError) {
    return (
      <DashboardSectionError
        title="Weekly Performance"
        message={performance.error?.message}
        onRetry={() => performance.refetch()}
      />
    );
  }

  if (performance.isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
        <div className="h-[160px] bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Weekly Volume</h3>
      <div className="h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
            />
            <Bar
              dataKey="volume"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
