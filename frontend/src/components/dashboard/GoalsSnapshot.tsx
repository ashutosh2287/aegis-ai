import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardSectionError } from './DashboardSectionError';
import type { GoalSnapshot } from '../../lib/dashboard.types';

interface GoalCardProps {
  goal: GoalSnapshot;
}

const GoalCard = ({ goal }: GoalCardProps) => {
  const estimatedDate = new Date(goal.estimatedCompletionDate).toLocaleDateString(
    'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900 truncate">{goal.name}</p>
        <span className="text-xs text-gray-500 shrink-0 ml-2">
          {estimatedDate}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full"
          style={{
            width: `${goal.progressPercent}%`,
            transition: 'width 0.6s ease',
          }}
        />
      </div>
      <p className="text-xs text-gray-500 text-right">
        {goal.progressPercent.toFixed(0)}%
      </p>
    </div>
  );
};

export const GoalsSnapshot = () => {
  const { kpis } = useDashboard();
  const navigate = useNavigate();

  if (kpis.isError) {
    return (
      <DashboardSectionError
        title="Goals Snapshot"
        message={kpis.error?.message}
        onRetry={() => kpis.refetch()}
      />
    );
  }

  if (kpis.isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-4 bg-gray-200 rounded w-28 mb-4 animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
              </div>
              <div className="h-2 bg-gray-200 rounded-full animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-8 ml-auto animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const goals = (kpis.data?.goals ?? []).slice(0, 3);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Goals</h3>

      {goals.length === 0 ? (
        <p className="text-sm text-gray-500 py-4 text-center">
          No active goals yet.
        </p>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <button
        onClick={() => navigate('/app/goals')}
        className="mt-4 w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        View All Goals
      </button>
    </div>
  );
};
