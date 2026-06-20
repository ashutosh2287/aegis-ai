import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useRecommendations } from '../../hooks/useAnalytics';
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '../../lib/analytics.constants';
import { DashboardSectionError } from './DashboardSectionError';
import type { Recommendation } from '../../lib/analytics.types';

const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-center gap-3 mb-3">
      <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
      <div className="ml-auto h-5 bg-gray-200 rounded-full w-14 animate-pulse" />
    </div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
    <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
  </div>
);

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDone: (index: number) => void;
  index: number;
}

const RecommendationCard = ({ recommendation, onDone, index }: RecommendationCardProps) => {
  const catConfig = CATEGORY_CONFIG[recommendation.category] ?? {
    label: recommendation.category,
    icon: null,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  };
  const priConfig = PRIORITY_CONFIG[recommendation.priority];
  const Icon = catConfig.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="bg-white rounded-xl border border-gray-200 p-5 overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-3">
        {Icon && (
          <div className={`h-9 w-9 ${catConfig.bgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${catConfig.color}`} />
          </div>
        )}
        <span className="text-sm font-medium text-gray-900">{catConfig.label}</span>
        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${priConfig.color}`}>
          {priConfig.label}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-800 mb-1">{recommendation.recommendation}</p>
      <p className="text-sm text-gray-500 mb-3">{recommendation.rationale}</p>
      <button
        onClick={() => onDone(index)}
        aria-label="Mark recommendation as done"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
      >
        <Check className="h-3.5 w-3.5" />
        Done
      </button>
    </motion.div>
  );
};

export const RecommendationsSection = () => {
  const { data, isLoading, isError, error, refetch } = useRecommendations();
  const [dismissedIndices, setDismissedIndices] = useState<Set<number>>(new Set());

  const visibleRecommendations = useMemo(() => {
    if (!data) return [];
    return data.map((rec, i) => ({ rec, originalIndex: i })).filter(({ originalIndex }) => !dismissedIndices.has(originalIndex));
  }, [data, dismissedIndices]);

  const handleDone = (originalIndex: number) => {
    setDismissedIndices((prev) => new Set(prev).add(originalIndex));
  };

  if (isError) {
    return (
      <DashboardSectionError
        title="Recommendations"
        message={error?.message}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Recommendations</h2>

      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : (
            <AnimatePresence mode="popLayout">
              {visibleRecommendations.map(({ rec, originalIndex }) => (
                <RecommendationCard
                  key={`${rec.category}-${originalIndex}`}
                  recommendation={rec}
                  onDone={handleDone}
                  index={originalIndex}
                />
              ))}
            </AnimatePresence>
          )}
      </div>

      {!isLoading && visibleRecommendations.length === 0 && data && data.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">All recommendations acknowledged.</p>
        </div>
      )}

      {!isLoading && data && data.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-500">No recommendations at this time.</p>
        </div>
      )}
    </div>
  );
};
