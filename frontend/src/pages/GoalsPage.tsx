import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Target, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGoals, useStrengthForecast, useVolumeForecast, useFrequencyForecast, useForecastRecommendations } from '../hooks/useGoals';
import { GoalCard, GoalCardSkeleton } from '../components/ui/GoalCard';
import { ForecastTimelineChart, ForecastTimelineChartSkeleton } from '../components/ui/ForecastTimelineChart';
import { EmptyForecastState } from '../components/ui/EmptyForecastState';
import { DashboardSectionError } from '../components/dashboard/DashboardSectionError';
import { SectionErrorBoundary } from '../components/dashboard/SectionErrorBoundary';
import { useAuthStore } from '../store/authStore';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

function ForecastRecommendationsSection() {
  const { data, isLoading, isError, error, refetch } = useForecastRecommendations();

  if (isError) {
    return (
      <DashboardSectionError
        title="Forecast Recommendations"
        message={error?.message}
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6">
        <div className="h-4 bg-aegis-border rounded w-48 mb-4 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-4 bg-aegis-dark rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-aegis-border rounded animate-pulse" />
                <div className="h-4 bg-aegis-border rounded w-32 animate-pulse" />
              </div>
              <div className="h-3 bg-aegis-border rounded w-full animate-pulse" />
              <div className="h-3 bg-aegis-border rounded w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const recommendations = data ?? [];

  if (recommendations.length === 0) {
    return (
      <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6">
        <h3 className="text-sm font-semibold text-white mb-2">Forecast Recommendations</h3>
        <p className="text-sm text-aegis-muted">No recommendations yet. Complete more workouts to receive personalized suggestions.</p>
      </div>
    );
  }

  return (
    <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Forecast Recommendations</h3>
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={`${rec.exerciseId}-${rec.goalType}`}
            className="p-4 bg-aegis-dark rounded-lg space-y-2"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-aegis-gold shrink-0" />
              <p className="text-sm font-medium text-white">
                {rec.exerciseName} · {rec.goalType}
              </p>
              <span className="ml-auto text-xs text-aegis-muted">
                {Math.round(rec.confidenceScore * 100)}% confidence
              </span>
            </div>
            <p className="text-sm text-aegis-muted">{rec.suggestedAdjustment}</p>
            <p className="text-xs text-aegis-muted">{rec.reasoning}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const GoalsPage = () => {
  const { data: goals, isLoading: goalsLoading, isError: goalsError, error: goalsErr, refetch: refetchGoals } = useGoals();
  const strengthForecast = useStrengthForecast();
  const volumeForecast = useVolumeForecast();
  const frequencyForecast = useFrequencyForecast();
  const targetDaysPerWeek = useAuthStore((s) => s.user?.targetDaysPerWeek);

  const [learnMoreUrl] = useState('https://docs.example.com/forecasts');

  const forecasts = [
    { type: 'strength' as const, query: strengthForecast, unit: ' kg' },
    { type: 'volume' as const, query: volumeForecast, unit: ' kg' },
    { type: 'frequency' as const, query: frequencyForecast, unit: '' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8"
    >
      {/* Stub data warning banner */}
      <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-300">Projections are placeholder data</p>
          <p className="text-xs text-amber-400/70 mt-1">
            The forecast and goal projections shown on this page currently return hardcoded stub values.
            They will be replaced with real calculations once the backend forecasting services are implemented.
          </p>
        </div>
      </div>

      {/* Frequency Target from Onboarding */}
      {targetDaysPerWeek && (
        <motion.section variants={sectionVariants}>
          <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-aegis-gold/10 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-aegis-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Your weekly frequency target
                  </p>
                  <p className="text-xs text-aegis-muted">
                    Set during onboarding — {targetDaysPerWeek} {targetDaysPerWeek === 1 ? 'day' : 'days'} per week
                  </p>
                </div>
              </div>
              <Link
                to="/app/dashboard"
                className="flex items-center gap-1 text-xs text-aegis-gold hover:text-aegis-gold-light transition-colors"
              >
                View progress
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </motion.section>
      )}

      {/* Section 1: Goal Cards */}
      <motion.section variants={sectionVariants}>
        <SectionErrorBoundary title="Goal Cards">
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Your Goals</h2>

            {goalsError && (
              <DashboardSectionError
                title="Goal Cards"
                message={goalsErr?.message}
                onRetry={() => refetchGoals()}
              />
            )}

            {goalsLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <GoalCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!goalsLoading && !goalsError && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(goals ?? []).map((goal, idx) => (
                  <motion.div
                    key={goal.goalId}
                    variants={cardVariants}
                    custom={idx}
                  >
                    <GoalCard goal={goal} />
                  </motion.div>
                ))}
              </div>
            )}

            {!goalsLoading && !goalsError && (goals ?? []).length === 0 && (
              <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-8 text-center">
                <Target className="h-10 w-10 text-aegis-muted mx-auto mb-3" />
                <p className="text-sm font-medium text-white mb-1">No active goals yet</p>
                <p className="text-xs text-aegis-muted">Complete more workouts and your goals will appear here automatically.</p>
              </div>
            )}
          </div>
        </SectionErrorBoundary>
      </motion.section>

      {/* Section 2 & 3: Forecast Timelines + Empty States */}
      {forecasts.map(({ type, query, unit }) => (
        <motion.section key={type} variants={sectionVariants}>
          <SectionErrorBoundary title={`${type.charAt(0).toUpperCase() + type.slice(1)} Forecast`}>
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                {type.charAt(0).toUpperCase() + type.slice(1)} Forecast
              </h2>

              {query.isError && (
                <DashboardSectionError
                  title={`${type.charAt(0).toUpperCase() + type.slice(1)} Forecast`}
                  message={query.error?.message}
                  onRetry={() => query.refetch()}
                />
              )}

              {query.isLoading && <ForecastTimelineChartSkeleton />}

              {!query.isLoading && !query.isError && (
                <>
                  {(query.data ?? []).length > 0 ? (
                    <ForecastTimelineChart data={query.data ?? []} unit={unit} />
                  ) : (
                    <EmptyForecastState onLearnMore={() => window.open(learnMoreUrl, '_blank')} />
                  )}
                </>
              )}
            </div>
          </SectionErrorBoundary>
        </motion.section>
      ))}

      {/* Section 4: Forecast Recommendations */}
      <motion.section variants={sectionVariants}>
        <SectionErrorBoundary title="Forecast Recommendations">
          <ForecastRecommendationsSection />
        </SectionErrorBoundary>
      </motion.section>
    </motion.div>
  );
};

export default GoalsPage;
