import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useSession } from '../hooks/useSession';
import { sessionService } from '../lib/session.service';
import { CountUp } from '../components/ui/CountUp';
import { ErrorCard } from '../components/ui/ErrorCard';

function formatDuration(startTime: string, endTime?: string): string {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
}

function computeStats(sessionData: NonNullable<ReturnType<typeof useSession>['session']>) {
  const exercises = sessionData.sessionExercises ?? [];
  let totalVolume = 0;
  let totalSets = 0;
  let exercisesCompleted = 0;

  for (const exercise of exercises) {
    const sets = exercise.sets ?? [];
    if (sets.length > 0) exercisesCompleted++;
    for (const set of sets) {
      totalSets++;
      totalVolume += set.weight * set.reps;
    }
  }

  return { totalVolume, totalSets, exercisesCompleted, exerciseCount: exercises.length };
}

export const SessionSummaryPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session: sessionData, isLoading, error, refetch } = useSession(sessionId ?? '');

  const [isStartingAgain, setIsStartingAgain] = useState(false);

  const handleDoItAgain = async () => {
    if (!sessionData?.workoutId || isStartingAgain) return;
    setIsStartingAgain(true);
    try {
      const newSession = await sessionService.createSession(sessionData.workoutId);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      navigate(`/app/session/${newSession.id}`);
    } catch (err) {
      console.error('Failed to start new session:', err);
      setIsStartingAgain(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-aegis-border rounded w-48" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-aegis-border rounded-lg" />
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-aegis-border rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <ErrorCard
          title="Failed to load session"
          message={error?.message || 'Session not found. Please try again.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const stats = computeStats(sessionData);
  const duration = formatDuration(sessionData.startTime, sessionData.endTime);
  const prSets = (sessionData.sessionExercises ?? []).flatMap((ex) =>
    (ex.sets ?? [])
      .filter((set) => {
        const sets = ex.sets ?? [];
        const maxWeight = Math.max(...sets.map((s) => s.weight));
        return set.weight === maxWeight && maxWeight > 0;
      })
      .map((set) => ({
        exerciseId: ex.id,
        setId: set.id,
        weight: set.weight,
        reps: set.reps,
      }))
  );
  const uniquePRs = prSets.filter(
    (pr, index, self) =>
      index === self.findIndex((p) => p.exerciseId === pr.exerciseId && p.weight === pr.weight)
  );

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">Session Complete</h1>
        <p className="text-aegis-muted mb-6">{sessionData.workout?.name ?? 'Workout'}</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-aegis-dark rounded-lg p-4 text-center"
        >
          <p className="text-2xl sm:text-3xl font-bold text-aegis-gold">
            <CountUp to={stats.totalSets} duration={1.2} />
          </p>
          <p className="text-sm text-aegis-muted mt-1">Sets</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-aegis-dark rounded-lg p-4 text-center"
        >
          <p className="text-2xl sm:text-3xl font-bold text-green-400">
            <CountUp to={stats.totalVolume} duration={1.5} />
          </p>
          <p className="text-sm text-aegis-muted mt-1">Volume (kg)</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-aegis-dark rounded-lg p-4 text-center"
        >
          <p className="text-2xl sm:text-3xl font-bold text-aegis-gold">
            <CountUp to={stats.exerciseCount} duration={1} />
          </p>
          <p className="text-sm text-aegis-muted mt-1">Exercises</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-aegis-dark rounded-lg p-4 text-center"
        >
          <p className="text-xl sm:text-3xl font-bold text-amber-400">{duration}</p>
          <p className="text-sm text-aegis-muted mt-1">Duration</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-lg font-semibold text-white mb-4">Exercise Breakdown</h2>
        <div className="space-y-3">
          {(sessionData.sessionExercises ?? [])
            .sort((a, b) => a.order - b.order)
            .map((exercise, idx) => {
              const sets = exercise.sets ?? [];
              const exerciseVolume = sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
              const hasPR = uniquePRs.some((pr) => pr.exerciseId === exercise.id);

              return (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.08 }}
                  className="bg-aegis-charcoal border border-aegis-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">
                        Exercise {exercise.order}
                      </h3>
                      {hasPR && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-aegis-gold/20 text-aegis-gold">
                          PR
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-aegis-muted mt-1">
                      {sets.length} sets &middot; {exerciseVolume.toLocaleString()} kg volume
                    </p>
                  </div>
                  <div className="text-right text-sm text-aegis-muted sm:ml-4">
                    {sets.map((set) => (
                      <span key={set.id} className="inline sm:block mr-2 sm:mr-0">
                        {set.weight}kg &times; {set.reps}
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 flex gap-3"
      >
        <button
          onClick={() => navigate('/app/analytics')}
          className="flex-1 bg-aegis-dark hover:bg-aegis-border text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-aegis-gold focus:ring-offset-2"
        >
          View Analytics
        </button>
        <button
          onClick={handleDoItAgain}
          disabled={isStartingAgain}
          className="flex-1 bg-aegis-gold hover:bg-aegis-gold-light text-aegis-black font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-aegis-gold focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,168,67,0.15)]"
        >
          {isStartingAgain ? 'Starting...' : 'Do It Again'}
        </button>
      </motion.div>
    </div>
  );
};

export default SessionSummaryPage;
