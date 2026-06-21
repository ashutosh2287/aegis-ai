import { useMemo, memo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ForecastHistoryPoint } from '../../lib/goals.types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface ForecastTimelineChartProps {
  data: ForecastHistoryPoint[];
  unit?: string;
}

export function ForecastTimelineChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <div className="h-4 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
      <div className="h-[200px] bg-gray-100 rounded-lg animate-pulse" />
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
      </div>
    </div>
  );
}

export const ForecastTimelineChart = memo(function ForecastTimelineChart({ data, unit = '' }: ForecastTimelineChartProps) {
  const labels = useMemo(() => data.map((d) => d.date), [data]);

  const actualData = useMemo(
    () => data.map((d) => (d.actualValue !== null ? d.actualValue : null)),
    [data],
  );

  const projectedData = useMemo(
    () => data.map((d) => (d.actualValue === null ? d.forecastValue : null)),
    [data],
  );

  const todayIndex = useMemo(() => {
    const idx = data.findIndex((d) => d.actualValue === null);
    return idx === -1 ? data.length - 1 : idx;
  }, [data]);

  const lastProjectedIndex = useMemo(() => {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].actualValue === null) return i;
    }
    return -1;
  }, [data]);

  const chartData = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: 'Actual',
          data: actualData,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          spanGaps: false,
          pointRadius: (ctx: { dataIndex: number }) => {
            if (ctx.dataIndex === todayIndex) return 5;
            return 0;
          },
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
        {
          label: 'Projected',
          data: projectedData,
          borderColor: '#6366f1',
          borderWidth: 2,
          borderDash: [6, 4],
          tension: 0.3,
          fill: false,
          spanGaps: false,
          pointRadius: (ctx: { dataIndex: number }) => {
            if (ctx.dataIndex === todayIndex) return 5;
            if (ctx.dataIndex === lastProjectedIndex) return 6;
            return 0;
          },
          pointBackgroundColor: (ctx: { dataIndex: number }) => {
            if (ctx.dataIndex === lastProjectedIndex) return '#10b981';
            return '#6366f1';
          },
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    }),
    [labels, actualData, projectedData, todayIndex, lastProjectedIndex],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#374151',
          bodyColor: '#374151',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: (items: Array<{ label: string }>) => items[0]?.label ?? '',
            label: (ctx: { datasetIndex: number; parsed: { y: number | null }; dataIndex: number }) => {
              const value = ctx.parsed.y;
              if (value === null) return '';
              const label = ctx.datasetIndex === 0 ? 'Actual' : 'Projected';
              return `${label}: ${value}${unit}`;
            },
            afterBody: (items: Array<{ dataIndex: number }>) => {
              const idx = items[0]?.dataIndex;
              if (idx === undefined) return '';
              if (idx < todayIndex) return 'Status: Historical';
              if (idx === todayIndex) return 'Status: Today';
              return 'Status: Projected';
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 11 },
            color: '#6b7280',
            maxRotation: 45,
            autoSkip: true,
            maxTicksLimit: 8,
          },
        },
        y: {
          grid: { color: '#f3f4f6' },
          ticks: {
            font: { size: 11 },
            color: '#6b7280',
            callback: (v: string | number) => `${v}${unit}`,
          },
        },
      },
    }),
    [unit, todayIndex],
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Forecast Timeline</h3>
      <div className="h-[200px] w-full" role="img" aria-label="Forecast timeline chart showing actual and projected values over time">
        <Line data={chartData} options={options} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-indigo-500 inline-block" />
          <span>Actual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-indigo-500 inline-block border-dashed" style={{ borderTop: '2px dashed #6366f1', height: 0 }} />
          <span>Projected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>Goal target</span>
        </div>
      </div>
    </div>
  );
});
