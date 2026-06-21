import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckCircle } from 'lucide-react';
import { useRecommendations } from '../../hooks/useAnalytics';
import { CATEGORY_CONFIG, PRIORITY_CONFIG } from '../../lib/analytics.constants';
import { ErrorCard } from '../ui/ErrorCard';
import type { Recommendation } from '../../lib/analytics.types';

const CardSkeleton = () => (
  <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5">
    <div className="flex items-center gap-3 mb-3">
      <div className="h-9 w-9 bg-aegis-border rounded-lg animate-pulse" />
      <div className="h-4 bg-aegis-border rounded w-24 animate-pulse" />
      <div className="ml-auto h-5 bg-aegis-border rounded-full w-14 animate-pulse" />
    </div>
    <div className="h-4 bg-aegis-border rounded w-full mb-2 animate-pulse" />
    <div className="h-3 bg-aegis-dark rounded w-3/4 animate-pulse" />
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

  const borderColors: Record<string, string> = {
    'progressive overload': 'border-l-indigo-500',
    recovery: 'border-l-emerald-500',
    consistency: 'border-l-blue-500',
    'plateau-based': 'border-l-amber-500',
  };
  const borderColor = borderColors[recommendation.category] ?? 'border-l-gray-300';

  return (
    <motion.div
      layout
      initial={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={`bg-aegis-charcoal rounded-xl border border-aegis-border border-l-4 ${borderColor} p-5 overflow-hidden`}
    >
      <div className="flex items-center gap-3 mb-3">
        {Icon && (
          <div className={`h-9 w-9 ${catConfig.bgColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${catConfig.color}`} />
          </div>
        )}
        <span className="text-sm font-medium text-white">{catConfig.label}</span>
        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${priConfig.color}`}>
          {priConfig.label}
        </span>
      </div>
      <p className="text-sm font-medium text-white mb-1">{recommendation.recommendation}</p>
      <p className="text-sm text-aegis-muted mb-3">{recommendation.rationale}</p>
      <button
        onClick={() => onDone(index)}
        aria-label="Mark recommendation as done"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-400 bg-green-900/30 rounded-lg hover:bg-green-900/50 transition-colors"
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
      <ErrorCard
        title="Failed to load recommendations"
        message={error?.message || 'Could not fetch recommendations.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
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
        <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-8 text-center">
          <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-white mb-1">All caught up!</p>
          <p className="text-xs text-aegis-muted">You've addressed all recommendations. Keep up the great work!</p>
        </div>
      )}

      {!isLoading && data && data.length === 0 && (
        <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-8 text-center">
          <CheckCircle className="h-10 w-10 text-aegis-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-white mb-1">No recommendations yet</p>
          <p className="text-xs text-aegis-muted">Keep training consistently to receive personalized recommendations.</p>
        </div>
      )}
    </div>
  );
};
