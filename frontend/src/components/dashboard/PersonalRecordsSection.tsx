import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Trophy, Weight, Repeat, Clock, Hash } from 'lucide-react';
import { usePersonalRecords } from '../../hooks/useAnalytics';
import { useExercises } from '../../hooks/useExercises';
import { DashboardSectionError } from './DashboardSectionError';
import type { PersonalRecord, PersonalRecordType } from '../../lib/analytics.types';

const PR_CONFIG: Record<
  PersonalRecordType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    format: (value: number) => string;
  }
> = {
  HEAVIEST_WEIGHT: {
    label: 'Heaviest Weight',
    icon: Weight,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    format: (v) => `${v} kg`,
  },
  MOST_REPS: {
    label: 'Most Reps',
    icon: Repeat,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    format: (v) => `${v}`,
  },
  HIGHEST_VOLUME: {
    label: 'Highest Volume',
    icon: Trophy,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    format: (v) => `${v.toLocaleString()} kg`,
  },
  LONGEST_SESSION: {
    label: 'Longest Session',
    icon: Clock,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    format: (v) => {
      const totalMinutes = Math.round(v / 60);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return `${h}:${m.toString().padStart(2, '0')}`;
    },
  },
  MOST_SETS: {
    label: 'Most Sets',
    icon: Hash,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    format: (v) => `${v}`,
  },
};

const RECORD_ORDER: PersonalRecordType[] = [
  'HEAVIEST_WEIGHT',
  'MOST_REPS',
  'HIGHEST_VOLUME',
  'LONGEST_SESSION',
  'MOST_SETS',
];

function getBadge(record: PersonalRecord): string | null {
  if (!record.achievedAt) return null;
  const daysSince = Math.floor(
    (Date.now() - new Date(record.achievedAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysSince <= 7) return 'Recent PR';
  if (daysSince <= 30) return 'Personal Best';
  return 'All Time PR';
}

function getBadgeColor(badge: string): string {
  switch (badge) {
    case 'Recent PR':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'Personal Best':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'All Time PR':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="h-3 bg-gray-100 rounded w-20 animate-pulse" />
        </div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-3" />
      <div className="h-5 bg-gray-100 rounded-full w-20 animate-pulse" />
    </div>
  );
}

interface PRCardProps {
  record: PersonalRecord;
  exerciseName: string;
  isNew: boolean;
}

function PRCard({ record, exerciseName, isNew }: PRCardProps) {
  const config = PR_CONFIG[record.type];
  const Icon = config.icon;
  const badge = getBadge(record);

  return (
    <motion.div
      layout
      initial={isNew ? { scale: [1, 1.02, 1] } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={isNew ? { duration: 0.6, ease: 'easeOut' } : { duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-200 p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${config.bgColor}`}
        >
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{exerciseName}</p>
          <p className="text-xs text-gray-500">{formatDate(record.achievedAt)}</p>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-3">
        {config.format(record.value)}
      </p>
      {badge && (
        <motion.span
          key={badge}
          initial={isNew ? { opacity: [0, 1], scale: [0.9, 1] } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(badge)}`}
        >
          {badge}
        </motion.span>
      )}
    </motion.div>
  );
}

export function PersonalRecordsSection() {
  const location = useLocation();
  const { data: records, isLoading, isError, error, refetch } = usePersonalRecords();
  const { exercises } = useExercises();

  const newPrExerciseId = useMemo(() => {
    const state = location.state as { newPrExerciseId?: string } | null;
    return state?.newPrExerciseId ?? null;
  }, [location.state]);

  const exerciseMap = useMemo(() => {
    if (!exercises) return new Map<string, string>();
    return new Map(exercises.map((e: { id: string; name: string }) => [e.id, e.name]));
  }, [exercises]);

  const sortedRecords = useMemo(() => {
    if (!records) return [];
    const map = new Map(records.map((r) => [r.type, r]));
    return RECORD_ORDER.map((type) => map.get(type)).filter(
      (r): r is PersonalRecord => r !== undefined,
    );
  }, [records]);

  if (isError) {
    return (
      <DashboardSectionError
        title="Personal Records"
        message={error?.message}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Personal Records</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          : sortedRecords.map((record) => {
              const exerciseName: string =
                record.exerciseId && exerciseMap.has(record.exerciseId)
                  ? exerciseMap.get(record.exerciseId)!
                  : PR_CONFIG[record.type].label;

              return (
                <PRCard
                  key={record.type}
                  record={record}
                  exerciseName={exerciseName}
                  isNew={!!record.exerciseId && record.exerciseId === newPrExerciseId}
                />
              );
            })}
      </div>

      {!isLoading && sortedRecords.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Trophy className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No personal records yet. Start training!</p>
        </div>
      )}
    </div>
  );
}
