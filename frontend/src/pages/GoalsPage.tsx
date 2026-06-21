import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Target } from 'lucide-react';
import { useGoals, useStrengthForecast, useVolumeForecast, useFrequencyForecast, useForecastRecommendations } from '../hooks/useGoals';
import { GoalCard, GoalCardSkeleton } from '../components/ui/GoalCard';
import { ForecastTimelineChart, ForecastTimelineChartSkeleton } from '../components/ui/ForecastTimelineChart';
import { EmptyForecastState } from '../components/ui/EmptyForecastState';
import { DashboardSectionError } from '../components/dashboard/DashboardSectionError';
import { SectionErrorBoundary } from '../components/dashboard/SectionErrorBoundary';

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
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-4 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
              <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const recommendations = data ?? [];

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Forecast Recommendations</h3>
        <p className="text-sm text-gray-500">No recommendations yet. Complete more workouts to receive personalized suggestions.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Forecast Recommendations</h3>
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={`${rec.exerciseId}-${rec.goalType}`}
            className="p-4 bg-gray-50 rounded-lg space-y-2"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-sm font-medium text-gray-900">
                {rec.exerciseName} · {rec.goalType}
              </p>
              <span className="ml-auto text-xs text-gray-400">
                {Math.round(rec.confidenceScore * 100)}% confidence
              </span>
            </div>
            <p className="text-sm text-gray-600">{rec.suggestedAdjustment}</p>
            <p className="text-xs text-gray-500">{rec.reasoning}</p>
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
      {/* Section 1: Goal Cards */}
      <motion.section variants={sectionVariants}>
        <SectionErrorBoundary title="Goal Cards">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Goals</h2>

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
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <Target className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">No active goals yet</p>
                <p className="text-xs text-gray-500">Complete more workouts and your goals will appear here automatically.</p>
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
