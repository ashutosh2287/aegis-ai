import { useNavigate } from 'react-router-dom';
import { Target } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { DashboardSectionError } from './DashboardSectionError';

export const GoalsSnapshot = () => {
  const { dashboard } = useDashboard();
  const navigate = useNavigate();

  if (dashboard.isError) {
    return (
      <DashboardSectionError
        title="Goals Snapshot"
        message={dashboard.error?.message}
        onRetry={() => dashboard.refetch()}
      />
    );
  }

  if (dashboard.isLoading) {
    return (
      <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6 hover:shadow-sm transition-shadow">
        <div className="h-3 bg-aegis-border rounded w-28 mb-4 animate-pulse" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-aegis-border rounded w-32 animate-pulse" />
                <div className="h-3 bg-aegis-border rounded w-20 animate-pulse" />
              </div>
              <div className="h-2 bg-aegis-border rounded-full animate-pulse" />
              <div className="h-3 bg-aegis-border rounded w-8 ml-auto animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6 hover:shadow-sm transition-shadow">
      <h3 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted mb-4">Goals</h3>

      <div className="text-center py-6">
        <Target className="h-8 w-8 text-aegis-muted mx-auto mb-2" />
        <p className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted mb-1">No goals endpoint</p>
        <p className="text-[11px] text-aegis-muted">Goals data not available from current API.</p>
      </div>

      <button
        onClick={() => navigate('/app/goals')}
        className="mt-4 w-full text-center text-[11px] font-semibold uppercase tracking-wider text-aegis-gold hover:text-aegis-gold-light transition-colors focus:outline-none focus:ring-2 focus:ring-aegis-gold focus:ring-offset-2 rounded-lg py-2"
      >
        View All Goals
      </button>
    </div>
  );
};
