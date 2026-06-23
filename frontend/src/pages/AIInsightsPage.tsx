import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Target, Flame, Clock, BarChart3, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import { useComparativeAnalytics, usePlateauDetection, useRecommendations, usePersonalRecords } from '../hooks/useAnalytics';
import { useDashboard } from '../hooks/useDashboard';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[10px] text-aegis-muted uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function TrendBadge({ value }: { value: number }) {
  if (value > 0) return <span className="flex items-center gap-1 text-xs text-green-400"><TrendingUp className="w-3 h-3" />+{value.toFixed(1)}%</span>;
  if (value < 0) return <span className="flex items-center gap-1 text-xs text-red-400"><TrendingDown className="w-3 h-3" />{value.toFixed(1)}%</span>;
  return <span className="flex items-center gap-1 text-xs text-aegis-muted"><Minus className="w-3 h-3" />0%</span>;
}

function PlateauCard({ type, confidence, explanation }: { type: string; confidence: number; explanation: string }) {
  const colors: Record<string, string> = {
    strength: 'border-red-500/30 bg-red-500/5',
    volume: 'border-yellow-500/30 bg-yellow-500/5',
    consistency: 'border-orange-500/30 bg-orange-500/5',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[type] || 'border-aegis-border bg-aegis-charcoal'}`}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-yellow-500" />
        <span className="text-xs font-medium text-white capitalize">{type} Plateau</span>
        <span className="text-[10px] text-aegis-muted ml-auto">{confidence}% confidence</span>
      </div>
      <p className="text-xs text-aegis-muted">{explanation}</p>
    </div>
  );
}

export default function AIInsightsPage() {
  const { dashboard } = useDashboard();
  const dashboardData = dashboard?.data;
  const { data: comparative } = useComparativeAnalytics('month');
  const { data: plateau } = usePlateauDetection();
  const { data: recommendations } = useRecommendations();
  const { data: records } = usePersonalRecords();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">AI Insights</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Current Streak" value={`${dashboardData?.workoutConsistency?.currentStreak || 0} days`} icon={Flame} color="text-aegis-gold" />
        <StatCard label="Workouts This Week" value={dashboardData?.workoutConsistency?.workoutsThisWeek || 0} icon={Target} color="text-blue-400" />
        <StatCard label="Workouts This Month" value={dashboardData?.workoutConsistency?.workoutsThisMonth || 0} icon={BarChart3} color="text-green-400" />
        <StatCard label="Avg/Week" value={dashboardData?.workoutConsistency?.averageWorkoutsPerWeek || 0} icon={Clock} color="text-purple-400" />
      </div>

      {/* Plateau Detection */}
      {plateau && plateau.plateauDetected && (
        <div className="space-y-2">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
            Plateau Warning
          </h2>
          <PlateauCard type={plateau.plateauType || 'strength'} confidence={plateau.confidence || 0} explanation={plateau.explanation || ''} />
        </div>
      )}

      {/* Comparative Analytics */}
      {comparative && (
        <div className="space-y-3">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">Weekly Comparison</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4">
              <p className="text-[10px] text-aegis-muted uppercase tracking-wider mb-1">Volume Change</p>
              <TrendBadge value={comparative.workoutVolume?.changePercentage || 0} />
            </div>
            <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4">
              <p className="text-[10px] text-aegis-muted uppercase tracking-wider mb-1">Frequency Change</p>
              <TrendBadge value={comparative.workoutFrequencyWeekly?.changePercentage || 0} />
            </div>
            <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4">
              <p className="text-[10px] text-aegis-muted uppercase tracking-wider mb-1">PRs This Week</p>
              <p className="text-lg font-bold text-white">{comparative.personalRecordsWeekly?.currentWeek || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted flex items-center gap-2">
            <Zap className="w-3 h-3 text-aegis-gold" />
            Recommended Actions
          </h2>
          <div className="grid gap-2">
            {recommendations.slice(0, 5).map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-aegis-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ArrowRight className="w-3 h-3 text-aegis-gold" />
                </div>
                <div>
                  <p className="text-sm text-white">{rec.recommendation}</p>
                  <p className="text-xs text-aegis-muted mt-1">{rec.rationale}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Records */}
      {records && records.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted flex items-center gap-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            Personal Records
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {records.slice(0, 6).map((pr, i) => (
              <div key={i} className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4">
                <p className="text-[10px] text-aegis-muted uppercase tracking-wider mb-1">{pr.type.replace(/_/g, ' ')}</p>
                <p className="text-lg font-bold text-white">{pr.value}{pr.type.includes('WEIGHT') ? ' kg' : pr.type.includes('SESSION') ? 's' : ''}</p>
                {pr.achievedAt && (
                  <p className="text-xs text-aegis-muted mt-1">
                    {new Date(pr.achievedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goal Projections */}
      {comparative?.currentConsistency && (
        <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5">
          <h3 className="text-xs text-aegis-muted uppercase tracking-wider mb-3">Consistency Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-aegis-gold">{comparative.currentConsistency.currentStreak}</p>
              <p className="text-[10px] text-aegis-muted">Current Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{comparative.currentConsistency.longestStreak}</p>
              <p className="text-[10px] text-aegis-muted">Longest Streak</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{comparative.currentConsistency.adherencePercentage?.toFixed(0) || 0}%</p>
              <p className="text-[10px] text-aegis-muted">Adherence</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{comparative.currentConsistency.totalWorkoutDays}</p>
              <p className="text-[10px] text-aegis-muted">Total Days</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
