import { useReducer, useEffect, useCallback, useState, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionService } from '../lib/session.service';
import { workoutService } from '../lib/workout.service';
import { ErrorCard } from '../components/ui/ErrorCard';
import { useToast } from '../hooks/useToast';


interface ExerciseState {
  id: string;
  workoutExerciseId: string;
  exerciseName: string;
  order: number;
  sets: SetState[];
}

interface SetState {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  previousBest: { weight: number; reps: number } | null;
  isPR: boolean;
}

interface SessionState {
  sessionId: string;
  workoutName: string;
  elapsedSeconds: number;
  exercises: ExerciseState[];
  expandedExerciseId: string | null;
  isFinishing: boolean;
}

type SessionAction =
  | { type: 'INIT'; sessionId: string; workoutName: string; exercises: ExerciseState[]; elapsedSeconds: number }
  | { type: 'TICK' }
  | { type: 'UPDATE_SET'; exerciseId: string; setId: string; field: 'weight' | 'reps'; value: number }
  | { type: 'CHECK_SET'; exerciseId: string; setId: string }
  | { type: 'SET_CHECKED'; exerciseId: string; setId: string; set: SetState }
  | { type: 'ADD_SET'; exerciseId: string }
  | { type: 'TOGGLE_EXPANDED'; exerciseId: string }
  | { type: 'SET_FINISHING' };

function recalculateStats(exercises: ExerciseState[]) {
  let completedSets = 0;
  let volume = 0;
  let exercisesCompleted = 0;

  for (const exercise of exercises) {
    let allCompleted = exercise.sets.length > 0;
    for (const set of exercise.sets) {
      if (set.completed) {
        completedSets++;
        volume += set.weight * set.reps;
      } else {
        allCompleted = false;
      }
    }
    if (allCompleted && exercise.sets.length > 0) {
      exercisesCompleted++;
    }
  }

  return { completedSets, volume, exercisesCompleted };
}

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        sessionId: action.sessionId,
        workoutName: action.workoutName,
        exercises: action.exercises,
        elapsedSeconds: action.elapsedSeconds,
        expandedExerciseId: action.exercises[0]?.id ?? null,
      };
    case 'TICK':
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };
    case 'UPDATE_SET': {
      const exercises = state.exercises.map(ex => {
        if (ex.id !== action.exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id !== action.setId) return s;
            return { ...s, [action.field]: action.value, isPR: false };
          }),
        };
      });
      return { ...state, exercises };
    }
    case 'CHECK_SET': {
      const exercises = state.exercises.map(ex => {
        if (ex.id !== action.exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id !== action.setId) return s;
            return { ...s, completed: !s.completed };
          }),
        };
      });
      return { ...state, exercises };
    }
    case 'SET_CHECKED': {
      const exercises = state.exercises.map(ex => {
        if (ex.id !== action.exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map(s => (s.id === action.setId ? action.set : s)),
        };
      });
      return { ...state, exercises };
    }
    case 'ADD_SET': {
      const exercises = state.exercises.map(ex => {
        if (ex.id !== action.exerciseId) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet: SetState = {
          id: `temp-${crypto.randomUUID()}`,
          setNumber: ex.sets.length + 1,
          weight: lastSet?.weight ?? 0,
          reps: lastSet?.reps ?? 0,
          completed: false,
          previousBest: null,
          isPR: false,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      });
      return { ...state, exercises };
    }
    case 'TOGGLE_EXPANDED':
      return {
        ...state,
        expandedExerciseId: state.expandedExerciseId === action.exerciseId ? null : action.exerciseId,
      };
    case 'SET_FINISHING':
      return { ...state, isFinishing: true };
    default:
      return state;
  }
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface ExerciseAccordionProps {
  exercise: ExerciseState;
  isExpanded: boolean;
  isCompleted: boolean;
  isSyncing: (setId: string) => boolean;
  onToggle: () => void;
  onUpdateSet: (setId: string, field: 'weight' | 'reps', value: number) => void;
  onCheckSet: (setId: string) => void;
  onAddSet: () => void;
}

const ExerciseAccordion = memo(({
  exercise,
  isExpanded,
  isCompleted,
  isSyncing,
  onToggle,
  onUpdateSet,
  onCheckSet,
  onAddSet,
}: ExerciseAccordionProps) => {
  const completedCount = exercise.sets.filter(s => s.completed).length;

  return (
    <div className="border border-aegis-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-aegis-charcoal transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`exercise-sets-${exercise.id}`}
      >
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className="font-medium text-white">{exercise.exerciseName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-aegis-muted">
            {completedCount}/{exercise.sets.length}
          </span>
          <motion.svg
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-4 h-4 text-aegis-muted"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </motion.svg>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            id={`exercise-sets-${exercise.id}`}
          >
            <div className="px-4 pb-4">
              <div className="grid grid-cols-[auto_1fr_1fr_auto] sm:grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 text-xs text-aegis-muted mb-2 px-1">
                <span>Set</span>
                <span className="hidden sm:inline">Prev Best</span>
                <span>Weight</span>
                <span>Reps</span>
                <span className="w-8" />
              </div>

              {exercise.sets.map(set => (
                <div
                  key={set.id}
                  className="grid grid-cols-[auto_1fr_1fr_auto] sm:grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 items-center mb-2"
                >
                  <span className="w-8 text-center font-medium text-sm text-white">
                    {set.setNumber}
                  </span>

                  <span className="hidden sm:inline text-sm text-aegis-muted text-center">
                    {set.previousBest
                      ? `${set.previousBest.weight}×${set.previousBest.reps}`
                      : '-'}
                  </span>

                  <input
                    type="number"
                    value={set.weight || ''}
                    onChange={e =>
                      onUpdateSet(set.id, 'weight', Number(e.target.value) || 0)
                    }
                    className="w-full bg-aegis-dark border border-aegis-border rounded px-2 py-1 text-sm text-center text-white focus:outline-none focus:ring-1 focus:ring-aegis-gold"
                    placeholder="0"
                    min={0}
                    aria-label={`Weight for set ${set.setNumber}`}
                  />

                  <input
                    type="number"
                    value={set.reps || ''}
                    onChange={e =>
                      onUpdateSet(set.id, 'reps', Number(e.target.value) || 0)
                    }
                    className="w-full bg-aegis-dark border border-aegis-border rounded px-2 py-1 text-sm text-center text-white focus:outline-none focus:ring-1 focus:ring-aegis-gold"
                    placeholder="0"
                    min={0}
                    aria-label={`Reps for set ${set.setNumber}`}
                  />

                  <div className="w-8 flex justify-center relative">
                    {isSyncing(set.id) ? (
                      <div className="w-4 h-4 border-2 border-aegis-border border-t-aegis-gold rounded-full animate-spin" />
                    ) : (
                      <button
                        onClick={() => onCheckSet(set.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          set.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-aegis-border hover:border-green-500'
                        }`}
                        aria-label={`Mark set ${set.setNumber} as ${set.completed ? 'incomplete' : 'complete'}`}
                        role="checkbox"
                        aria-checked={set.completed}
                      >
                        {set.completed && (
                          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )}

                    <AnimatePresence>
                      {set.isPR && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
                        >
                          PR!
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}

              <button
                onClick={onAddSet}
                className="mt-2 text-sm text-aegis-gold hover:text-aegis-gold-light font-medium"
                aria-label={`Add set to ${exercise.exerciseName}`}
              >
                + Add Set
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ExerciseAccordion.displayName = 'ExerciseAccordion';

export const ActiveSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: session, isLoading, error, refetch } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionService.getSession(sessionId!),
    enabled: !!sessionId,
  });

  const { data: workoutExercises = [] } = useQuery({
    queryKey: ['workoutExercises', session?.workoutId],
    queryFn: () => workoutService.getWorkoutExercises(session!.workoutId),
    enabled: !!session?.workoutId,
  });

  const exerciseNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const we of workoutExercises) {
      if (we.exercise?.name) {
        map.set(we.id, we.exercise.name);
      }
    }
    return map;
  }, [workoutExercises]);

  const [state, dispatch] = useReducer(sessionReducer, {
    sessionId: '',
    workoutName: '',
    elapsedSeconds: 0,
    exercises: [],
    expandedExerciseId: null,
    isFinishing: false,
  });

  const [syncingSets, setSyncingSets] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session) return;
    const startTime = new Date(session.startTime).getTime();
    const now = Date.now();
    const elapsed = Math.max(0, Math.floor((now - startTime) / 1000));

    const exercises: ExerciseState[] = (session.sessionExercises ?? [])
      .sort((a, b) => a.order - b.order)
      .map(se => {
        const sets: SetState[] = (se.sets ?? [])
          .sort((a, b) => a.setNumber - b.setNumber)
          .map(s => ({
            id: s.id,
            setNumber: s.setNumber,
            weight: s.weight,
            reps: s.reps,
            completed: true,
            previousBest: null,
            isPR: false,
          }));
        return {
          id: se.id,
          workoutExerciseId: se.workoutExerciseId,
          exerciseName: exerciseNameMap.get(se.workoutExerciseId) ?? 'Unknown Exercise',
          order: se.order,
          sets,
        };
      });

    dispatch({
      type: 'INIT',
      sessionId: session.id,
      workoutName: session.workout?.name ?? 'Workout',
      exercises,
      elapsedSeconds: elapsed,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, exerciseNameMap]);

  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateSet = useCallback(
    (exerciseId: string, setId: string, field: 'weight' | 'reps', value: number) => {
      dispatch({ type: 'UPDATE_SET', exerciseId, setId, field, value });
    },
    [],
  );

  const handleCheckSet = useCallback(
    async (exerciseId: string, setId: string) => {
      dispatch({ type: 'CHECK_SET', exerciseId, setId });

      const exercise = state.exercises.find(e => e.id === exerciseId);
      const set = exercise?.sets.find(s => s.id === setId);
      if (!exercise || !set || !sessionId) return;

      const newCompleted = !set.completed;

      setSyncingSets(prev => new Set(prev).add(setId));
      try {
        const updated = await sessionService.updateWorkoutSet(sessionId, exerciseId, setId, {
          weight: set.weight,
          reps: set.reps,
          setNumber: set.setNumber,
        });

        const bestForExercise = exercise.sets.reduce<{ weight: number; reps: number } | null>(
          (best, s) => {
            if (s.id === setId || !s.completed) return best;
            const vol = s.weight * s.reps;
            if (!best || vol > best.weight * best.reps) return { weight: s.weight, reps: s.reps };
            return best;
          },
          null,
        );

        const currentVol = newCompleted ? updated.weight * updated.reps : 0;
        const prevVol = bestForExercise ? bestForExercise.weight * bestForExercise.reps : 0;
        const isPR = newCompleted && currentVol > 0 && currentVol > prevVol;

        dispatch({
          type: 'SET_CHECKED',
          exerciseId,
          setId,
          set: {
            ...set,
            id: updated.id,
            weight: updated.weight,
            reps: updated.reps,
            completed: newCompleted,
            previousBest: bestForExercise,
            isPR,
          },
        });
      } catch {
        dispatch({ type: 'CHECK_SET', exerciseId, setId });
      } finally {
        setSyncingSets(prev => {
          const next = new Set(prev);
          next.delete(setId);
          return next;
        });
      }
    },
    [state.exercises, sessionId],
  );

  const handleAddSet = useCallback((exerciseId: string) => {
    dispatch({ type: 'ADD_SET', exerciseId });
  }, []);

  const handleToggleExpanded = useCallback((exerciseId: string) => {
    dispatch({ type: 'TOGGLE_EXPANDED', exerciseId });
  }, []);

  const handleFinish = useCallback(async () => {
    if (!sessionId || state.isFinishing) return;
    dispatch({ type: 'SET_FINISHING' });
    try {
      await sessionService.completeSession(sessionId);
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['history'] });
      showToast('Session completed!');
      navigate(`/app/session-summary/${sessionId}`);
    } catch {
      dispatch({ type: 'SET_FINISHING' });
    }
  }, [sessionId, state.isFinishing, navigate, queryClient, showToast]);

  const stats = useMemo(() => recalculateStats(state.exercises), [state.exercises]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-aegis-border rounded w-48" />
          <div className="h-4 bg-aegis-border rounded w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-aegis-border rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
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

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="min-w-0 flex-1 mr-4">
          <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{state.workoutName}</h1>
          <p className="text-aegis-muted text-sm font-mono" aria-live="polite" aria-atomic="true">{formatTime(state.elapsedSeconds)}</p>
        </div>
        <button
          onClick={handleFinish}
          disabled={state.isFinishing}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {state.isFinishing ? 'Finishing...' : 'Finish'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6" role="status" aria-live="polite">
        <div className="bg-aegis-dark rounded-lg p-2 sm:p-3 text-center">
          <p className="text-lg sm:text-2xl font-bold text-aegis-gold">{stats.completedSets}</p>
          <p className="text-[10px] sm:text-xs text-aegis-muted">Sets Done</p>
        </div>
        <div className="bg-aegis-dark rounded-lg p-2 sm:p-3 text-center">
          <p className="text-lg sm:text-2xl font-bold text-green-400">{stats.volume.toLocaleString()}</p>
          <p className="text-[10px] sm:text-xs text-aegis-muted">Volume (kg)</p>
        </div>
        <div className="bg-aegis-dark rounded-lg p-2 sm:p-3 text-center">
          <p className="text-lg sm:text-2xl font-bold text-aegis-gold">{stats.exercisesCompleted}</p>
          <p className="text-[10px] sm:text-xs text-aegis-muted">Exercises Done</p>
        </div>
      </div>

      <div className="space-y-3">
        {state.exercises.map(exercise => (
          <ExerciseAccordion
            key={exercise.id}
            exercise={exercise}
            isExpanded={state.expandedExerciseId === exercise.id}
            isCompleted={exercise.sets.length > 0 && exercise.sets.every(s => s.completed)}
            isSyncing={(setId) => syncingSets.has(setId)}
            onToggle={() => handleToggleExpanded(exercise.id)}
            onUpdateSet={(setId, field, value) => handleUpdateSet(exercise.id, setId, field, value)}
            onCheckSet={(setId) => handleCheckSet(exercise.id, setId)}
            onAddSet={() => handleAddSet(exercise.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ActiveSessionPage;
