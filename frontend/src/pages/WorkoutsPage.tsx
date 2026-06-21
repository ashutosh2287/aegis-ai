import { useState } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { sessionService } from '../lib/session.service';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Plus, Play } from 'lucide-react';
import { ErrorCard } from '../components/ui/ErrorCard';
import type { Workout } from '../lib/workout.types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
};

const getRecencyBadge = (updatedAt: string) => {
  const daysSince = Math.floor(
    (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSince <= 3) {
    return { label: 'Recent', className: 'bg-emerald-100 text-emerald-700' };
  }
  if (daysSince <= 7) {
    return { label: `${daysSince}d ago`, className: 'bg-amber-100 text-amber-700' };
  }
  return { label: `${daysSince}d ago`, className: 'bg-gray-100 text-gray-500' };
};

const getMuscleGroupTags = (workout: Workout): string[] => {
  const muscleGroups = workout.workoutExercises
    ?.map((we) => we.exercise?.muscleGroup)
    .filter((mg): mg is string => !!mg) || [];
  return [...new Set(muscleGroups)];
};

export const WorkoutsPage = () => {
  const { workouts, isLoading, error, refetch } = useWorkouts();
  const navigate = useNavigate();
  const [startingWorkoutId, setStartingWorkoutId] = useState<string | null>(null);

  const handleStartWorkout = async (workoutId: string) => {
    if (startingWorkoutId) return;
    setStartingWorkoutId(workoutId);
    try {
      const session = await sessionService.createSession(workoutId);
      navigate(`/app/session/${session.id}`, { state: { workoutId } });
    } catch (err) {
      console.error('Failed to start workout session:', err);
      setStartingWorkoutId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h1 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">My Workouts</h1>
          <div className="h-9 w-32 bg-aegis-border rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <div
              key={index}
              className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5"
            >
              <div className="h-5 bg-aegis-border rounded w-40 mb-3 animate-pulse" />
              <div className="h-3 bg-aegis-dark rounded w-full mb-4 animate-pulse" />
              <div className="flex gap-2 mb-4">
                <div className="h-5 bg-aegis-dark rounded-full w-20 animate-pulse" />
                <div className="h-5 bg-aegis-dark rounded-full w-16 animate-pulse" />
              </div>
              <div className="h-9 bg-aegis-dark rounded-lg w-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h1 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">My Workouts</h1>
          <button
            onClick={() => navigate('/app/workout-builder')}
            className="inline-flex items-center gap-1.5 border border-aegis-border text-aegis-muted hover:bg-white/5 font-medium text-[11px] uppercase tracking-wider py-2 px-3 rounded-lg transition-colors self-start"
          >
            <Plus className="h-3.5 w-3.5" />
            New Workout
          </button>
        </div>
        <ErrorCard
          title="Failed to load workouts"
          message={error.message || 'Could not fetch your workouts. Please check your connection and try again.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h1 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">My Workouts</h1>
          <button
            onClick={() => navigate('/app/workout-builder')}
            className="inline-flex items-center gap-1.5 border border-aegis-border text-aegis-muted hover:bg-white/5 font-medium text-[11px] uppercase tracking-wider py-2 px-3 rounded-lg transition-colors self-start"
          >
            <Plus className="h-3.5 w-3.5" />
            New Workout
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 bg-aegis-dark rounded-full flex items-center justify-center mb-4">
            <Dumbbell className="h-7 w-7 text-aegis-muted" />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted mb-4">
            No workouts yet
          </p>
          <button
            onClick={() => navigate('/app/workout-builder')}
            className="inline-flex items-center gap-1.5 bg-aegis-gold text-aegis-black hover:bg-aegis-gold-light font-medium text-[11px] uppercase tracking-wider py-2.5 px-5 rounded-lg transition-colors shadow-[0_0_20px_rgba(212,168,67,0.15)]"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Your First Workout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">My Workouts</h1>
        <button
          onClick={() => navigate('/app/workout-builder')}
          className="inline-flex items-center gap-1.5 border border-aegis-border text-aegis-muted hover:bg-white/5 font-medium text-[11px] uppercase tracking-wider py-2 px-3 rounded-lg transition-colors self-start"
        >
          <Plus className="h-3.5 w-3.5" />
          New Workout
        </button>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {workouts.map((workout) => {
          const recency = getRecencyBadge(workout.updatedAt);
          const isStarting = startingWorkoutId === workout.id;

          return (
            <motion.div
              key={workout.id}
              variants={cardVariants}
              className={`bg-aegis-charcoal rounded-xl border border-aegis-border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
                isStarting ? 'opacity-60 cursor-wait' : 'cursor-pointer'
              }`}
              onClick={() => handleStartWorkout(workout.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStartWorkout(workout.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Start workout: ${workout.name}`}
              aria-busy={isStarting}
            >
              <div className="mb-1">
                <h2 className="text-[16px] font-semibold text-white truncate">{workout.name}</h2>
                {workout.description && (
                  <p className="text-[11px] text-aegis-muted mt-1 line-clamp-2">{workout.description}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mb-4">
                <span className="text-[10px] font-semibold bg-aegis-dark text-aegis-muted px-2 py-0.5 rounded-full">
                  {workout.workoutExercises?.length || 0} exercises
                </span>
                {getMuscleGroupTags(workout).map((muscleGroup, index) => (
                  <span
                    key={index}
                    className="text-[10px] font-semibold bg-aegis-gold/10 text-aegis-gold px-2 py-0.5 rounded-full"
                  >
                    {muscleGroup}
                  </span>
                ))}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${recency.className}`}>
                  {recency.label}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartWorkout(workout.id);
                }}
                disabled={isStarting}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-aegis-gold text-aegis-black hover:bg-aegis-gold-light font-medium text-[11px] uppercase tracking-wider py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait shadow-[0_0_20px_rgba(212,168,67,0.15)]"
              >
                {isStarting ? (
                  <span>Starting...</span>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    Start
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default WorkoutsPage;
