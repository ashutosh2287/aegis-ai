import { useMemo } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardSectionError } from './DashboardSectionError';

const CELL_SIZE = 13;
const GAP = 3;
const TRAINED_COLOR = '#1D9E75';
const REST_COLOR = 'transparent';
const BORDER_COLOR = '#e5e7eb';

interface GridCellProps {
  date: string;
  trained: boolean;
  row: number;
  col: number;
}

const GridCell = ({ date, trained, row, col }: GridCellProps) => (
  <div
    className="rounded-sm"
    style={{
      width: CELL_SIZE,
      height: CELL_SIZE,
      backgroundColor: trained ? TRAINED_COLOR : REST_COLOR,
      border: `1px solid ${BORDER_COLOR}`,
      gridColumn: col + 1,
      gridRow: row + 1,
    }}
    title={`${date}${trained ? ' - Trained' : ' - Rest'}`}
  />
);

const getWeeksData = (heatmapData: Array<{ date: string; trained: boolean }>) => {
  if (heatmapData.length === 0) return [];

  const weeks: Array<Array<{ date: string; trained: boolean } | null>> = [];
  let currentWeek: Array<{ date: string; trained: boolean } | null> = [];

  for (const day of heatmapData) {
    const dayOfWeek = new Date(day.date).getDay();

    if (currentWeek.length === 0 && dayOfWeek !== 0) {
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push(null);
      }
    }

    currentWeek.push(day);

    if (dayOfWeek === 6 || day === heatmapData[heatmapData.length - 1]) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  return weeks;
};

export const ConsistencyGrid = () => {
  const { overview } = useDashboard();

  const weeks = useMemo(() => {
    return getWeeksData(overview.data?.heatmapData ?? []);
  }, [overview.data]);

  if (overview.isError) {
    return (
      <DashboardSectionError
        title="Consistency Grid"
        message={overview.error?.message}
        onRetry={() => overview.refetch()}
      />
    );
  }

  if (overview.isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
        <div className="h-[200px] bg-gray-100 rounded-lg animate-pulse" />
        <div className="mt-4 flex gap-8">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      </div>
    );
  }

  const adherencePercentage = overview.data?.adherencePercentage ?? 0;
  const bestStreak = overview.data?.longestStreak ?? 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Consistency</h3>

      <div
        className="w-fit"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(7, ${CELL_SIZE}px)`,
          gridAutoRows: `${CELL_SIZE}px`,
          gap: GAP,
        }}
      >
        {weeks.map((week, weekIdx) =>
          week.map((day, dayIdx) =>
            day ? (
              <GridCell
                key={day.date}
                date={day.date}
                trained={day.trained}
                row={weekIdx}
                col={dayIdx}
              />
            ) : (
              <div
                key={`empty-${weekIdx}-${dayIdx}`}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  gridColumn: dayIdx + 1,
                  gridRow: weekIdx + 1,
                }}
              />
            )
          )
        )}
      </div>

      <div className="mt-4 flex items-center gap-8 text-sm">
        <div>
          <span className="text-gray-500">Adherence: </span>
          <span className="font-semibold text-gray-900">
            {adherencePercentage.toFixed(0)}%
          </span>
        </div>
        <div>
          <span className="text-gray-500">Best Streak: </span>
          <span className="font-semibold text-gray-900">
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
          <span className="text-xs text-gray-500">Rest</span>
          <div
            className="rounded-sm"
            style={{
              width: 10,
              height: 10,
              backgroundColor: TRAINED_COLOR,
            }}
          />
          <span className="text-xs text-gray-500">Trained</span>
        </div>
      </div>
    </div>
  );
};
