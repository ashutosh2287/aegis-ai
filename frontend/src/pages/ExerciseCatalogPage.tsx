import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Dumbbell,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { exerciseService } from '../lib/exercise.service';
import { ErrorCard } from '../components/ui/ErrorCard';
import type { Exercise, StrengthTrend } from '../lib/exercise.types';

export const ExerciseCatalogPage = () => {
  const [search, setSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const {
    data: exercises = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Exercise[], Error>({
    queryKey: ['exercises'],
    queryFn: () => exerciseService.getExercises(),
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return exercises;
    const q = search.toLowerCase();
    return exercises.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.muscleGroup?.toLowerCase().includes(q) ||
        e.equipment?.toLowerCase().includes(q)
    );
  }, [exercises, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Exercise[]>();
    for (const ex of filtered) {
      const group = ex.muscleGroup || 'Other';
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(ex);
    }
    const sorted = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return sorted;
  }, [filtered]);

  const handleSelect = useCallback((exercise: Exercise) => {
    setSelectedExercise(exercise);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedExercise(null);
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">Exercise Catalog</h1>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">Exercise Catalog</h1>
        <ErrorCard
          title="Failed to load exercises"
          message={error.message || 'Could not fetch the exercise catalog. Please try again.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Exercise Catalog</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <Dumbbell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-lg">No exercises found</p>
          <p className="text-sm mt-1">Try a different search term.</p>
        </div>
      )}

      <div className="space-y-8">
        {grouped.map(([muscleGroup, exercises]) => (
          <motion.div
            key={muscleGroup}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {muscleGroup}
            </h2>
            <div className="space-y-2">
              {exercises.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => handleSelect(exercise)}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                  aria-label={`View details for ${exercise.name}`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{exercise.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {exercise.muscleGroup && (
                        <span className="text-xs text-gray-500">{exercise.muscleGroup}</span>
                      )}
                      {exercise.equipment && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-500">{exercise.equipment}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 ml-3" />
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedExercise && (
          <DetailDrawer exercise={selectedExercise} onClose={handleClose} />
        )}
      </AnimatePresence>
    </div>
  );
};

function DetailDrawer({
  exercise,
  onClose,
}: {
  exercise: Exercise;
  onClose: () => void;
}) {
  const {
    data: trend,
    isLoading: trendLoading,
    error: trendError,
  } = useQuery<StrengthTrend, Error>({
    queryKey: ['strengthTrend', exercise.id],
    queryFn: () => exerciseService.getStrengthTrend(exercise.id),
    enabled: !!exercise.id,
  });

  const chartData = useMemo(() => {
    if (!trend?.dataPoints) return [];
    return trend.dataPoints.map((dp) => ({
      date: new Date(dp.sessionDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      weight: dp.averageWeight,
      volume: dp.totalVolume,
    }));
  }, [trend]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (exercise) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [exercise, onClose]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={`Exercise details: ${exercise.name}`}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{exercise.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {exercise.muscleGroup && (
                  <span className="text-sm text-gray-500">{exercise.muscleGroup}</span>
                )}
                {exercise.equipment && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-500">{exercise.equipment}</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              aria-label="Close exercise details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {exercise.description && (
            <p className="text-sm text-gray-600 mb-6">{exercise.description}</p>
          )}

          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Strength Trend
          </h3>

          {trendLoading && (
            <div className="space-y-3 py-4">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
            </div>
          )}

          {trendError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-sm">{trendError.message}</p>
              </div>
            </div>
          )}

          {trend && chartData.length === 0 && !trendLoading && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-sm">No trend data available yet.</p>
              <p className="text-xs mt-1">Complete workouts to see your progress here.</p>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#6366f1' }}
                    activeDot={{ r: 5 }}
                    name="Avg Weight"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

export default ExerciseCatalogPage;
