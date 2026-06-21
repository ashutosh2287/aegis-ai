import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Target,
  AlertTriangle,
  Lightbulb,
  Trophy,
  Zap,
  BarChart3,
  Dumbbell,
} from 'lucide-react';
import { useComparativeAnalytics, usePlateauDetection, useRecommendations, usePersonalRecords } from '../hooks/useAnalytics';
import { ErrorCard } from '../components/ui/ErrorCard';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

interface Insight {
  id: string;
  icon: React.ReactNode;
  headline: string;
  explanation: string;
  category: 'progress' | 'warning' | 'achievement' | 'tip';
}

const categoryStyles: Record<string, { iconBg: string; iconColor: string }> = {
  progress: { iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  warning: { iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  achievement: { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  tip: { iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
};

function InsightCard({ insight }: { insight: Insight }) {
  const style = categoryStyles[insight.category] ?? categoryStyles.tip;

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${style.iconBg}`}>
          <span className={style.iconColor}>{insight.icon}</span>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">{insight.headline}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{insight.explanation}</p>
        </div>
      </div>
    </motion.div>
  );
}

function InsightCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-gray-100 rounded w-full animate-pulse" />
          <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function deriveInsights(
  comparative: ReturnType<typeof useComparativeAnalytics>['data'],
  plateau: ReturnType<typeof usePlateauDetection>['data'],
  recommendations: ReturnType<typeof useRecommendations>['data'],
  records: ReturnType<typeof usePersonalRecords>['data']
): Insight[] {
  const insights: Insight[] = [];

  if (comparative) {
    const volChange = comparative.workoutVolume.changePercentage;
    if (volChange > 10) {
      insights.push({
        id: 'volume-up',
        icon: <TrendingUp className="h-5 w-5" />,
        headline: 'Volume is climbing',
        explanation: `Your training volume increased ${volChange.toFixed(0)}% compared to last week. Keep up the momentum.`,
        category: 'progress',
      });
    } else if (volChange < -10) {
      insights.push({
        id: 'volume-down',
        icon: <TrendingDown className="h-5 w-5" />,
        headline: 'Volume dropped this week',
        explanation: `Training volume is down ${Math.abs(volChange).toFixed(0)}%. Consider adding an extra session to get back on track.`,
        category: 'warning',
      });
    }

    const streak = comparative.currentConsistency.currentStreak;
    if (streak >= 3) {
      insights.push({
        id: 'streak',
        icon: <Flame className="h-5 w-5" />,
        headline: `${streak}-day streak going strong`,
        explanation: `You've trained ${streak} days in a row. Consistency is the biggest driver of progress.`,
        category: 'achievement',
      });
    }

    const freq = comparative.workoutFrequencyWeekly.currentWeek;
    if (freq >= 4) {
      insights.push({
        id: 'high-freq',
        icon: <Zap className="h-5 w-5" />,
        headline: 'High training frequency',
        explanation: `${freq} workouts this week. Make sure you're allowing enough recovery between sessions.`,
        category: 'tip',
      });
    }

    const consistency = comparative.currentConsistency.adherencePercentage;
    if (consistency < 50) {
      insights.push({
        id: 'low-adherence',
        icon: <Target className="h-5 w-5" />,
        headline: 'Adherence could improve',
        explanation: `You're at ${consistency.toFixed(0)}% adherence to your training schedule. Even one extra session a week makes a difference.`,
        category: 'warning',
      });
    }
  }

  if (plateau?.plateauDetected && plateau.confidence && plateau.confidence > 60) {
    insights.push({
      id: 'plateau',
      icon: <AlertTriangle className="h-5 w-5" />,
      headline: `${plateau.plateauType ?? 'Progress'} plateau detected`,
      explanation: plateau.explanation ?? 'Your progress in this area has stalled. Consider varying your routine or adjusting intensity.',
      category: 'warning',
    });
  }

  if (recommendations && recommendations.length > 0) {
    const topRec = recommendations[0];
    insights.push({
      id: 'top-rec',
      icon: <Lightbulb className="h-5 w-5" />,
      headline: topRec.recommendation.length > 40
        ? topRec.recommendation.slice(0, 40) + '...'
        : topRec.recommendation,
      explanation: topRec.rationale,
      category: 'tip',
    });
  }

  if (records && records.length > 0) {
    const recentPR = records.find((r) => {
      if (!r.achievedAt) return false;
      const days = Math.floor((Date.now() - new Date(r.achievedAt).getTime()) / (1000 * 60 * 60 * 24));
      return days <= 7;
    });
    if (recentPR) {
      insights.push({
        id: 'recent-pr',
        icon: <Trophy className="h-5 w-5" />,
        headline: 'New personal record this week',
        explanation: `You set a new ${recentPR.type.replace(/_/g, ' ').toLowerCase()} record. Great progress!`,
        category: 'achievement',
      });
    }
  }

  if (insights.length === 0 && comparative) {
    insights.push({
      id: 'getting-started',
      icon: <Dumbbell className="h-5 w-5" />,
      headline: 'Building your profile',
      explanation: 'Complete more workouts to unlock personalized AI insights about your training patterns.',
      category: 'tip',
    });
  }

  return insights;
}

export const InsightsPage = () => {
  const comparative = useComparativeAnalytics('week');
  const plateau = usePlateauDetection();
  const recommendations = useRecommendations();
  const records = usePersonalRecords();

  const isLoading = comparative.isLoading || plateau.isLoading || recommendations.isLoading || records.isLoading;
  const hasError = comparative.isError || plateau.isError || recommendations.isError || records.isError;
  const firstError = comparative.error || plateau.error || recommendations.error || records.error;
  const refetch = () => {
    comparative.refetch();
    plateau.refetch();
    recommendations.refetch();
    records.refetch();
  };

  const insights = useMemo(
    () => deriveInsights(comparative.data, plateau.data, recommendations.data, records.data),
    [comparative.data, plateau.data, recommendations.data, records.data]
  );

  if (hasError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ErrorCard
          title="Failed to load insights"
          message={firstError?.message || 'Could not fetch analytics data for insights.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div>
        <h1 className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-1">Insights</h1>
        <h2 className="text-lg font-semibold text-gray-900">AI-Generated Observations</h2>
        <p className="text-sm text-gray-500 mt-1">
          Personalized observations based on your training data, consistency, and progress patterns.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <InsightCardSkeleton key={i} />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Not enough data yet</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Complete a few more workouts and your personalized insights will appear here.
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default InsightsPage;
