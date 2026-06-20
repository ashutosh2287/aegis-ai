import { useReducer, useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionService } from '../lib/session.service';


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

export const ActiveSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => sessionService.getSession(sessionId!),
    enabled: !!sessionId,
  });

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
          exerciseName: se.workoutExerciseId,
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
  }, [session?.id]);

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
      navigate(`/app/session-summary/${sessionId}`);
    } catch {
      dispatch({ type: 'SET_FINISHING' });
    }
  }, [sessionId, state.isFinishing, navigate, queryClient]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
          <p className="font-medium">Failed to load session</p>
          <p className="text-sm mt-1">{error?.message ?? 'Session not found'}</p>
        </div>
      </div>
    );
  }

  const stats = recalculateStats(state.exercises);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{state.workoutName}</h1>
          <p className="text-gray-500 text-sm font-mono">{formatTime(state.elapsedSeconds)}</p>
        </div>
        <button
          onClick={handleFinish}
          disabled={state.isFinishing}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          {state.isFinishing ? 'Finishing...' : 'Finish'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.completedSets}</p>
          <p className="text-xs text-gray-500">Sets Done</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.volume.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Volume (kg)</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.exercisesCompleted}</p>
          <p className="text-xs text-gray-500">Exercises Done</p>
        </div>
      </div>

      <div className="space-y-3">
        {state.exercises.map(exercise => {
          const isExpanded = state.expandedExerciseId === exercise.id;
          const exerciseCompleted = exercise.sets.length > 0 && exercise.sets.every(s => s.completed);

          return (
            <div key={exercise.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => handleToggleExpanded(exercise.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${exerciseCompleted ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="font-medium">{exercise.exerciseName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {exercise.sets.filter(s => s.completed).length}/{exercise.sets.length}
                  </span>
                  <motion.svg
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-4 h-4 text-gray-400"
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
                  >
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 text-xs text-gray-500 mb-2 px-1">
                        <span>Set</span>
                        <span>Prev Best</span>
                        <span>Weight</span>
                        <span>Reps</span>
                        <span className="w-8" />
                      </div>

                      {exercise.sets.map(set => (
                        <div
                          key={set.id}
                          className="grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-2 items-center mb-2"
                        >
                          <span className="w-8 text-center font-medium text-sm">
                            {set.setNumber}
                          </span>

                          <span className="text-sm text-gray-500 text-center">
                            {set.previousBest
                              ? `${set.previousBest.weight}×${set.previousBest.reps}`
                              : '-'}
                          </span>

                          <input
                            type="number"
                            value={set.weight || ''}
                            onChange={e =>
                              handleUpdateSet(exercise.id, set.id, 'weight', Number(e.target.value) || 0)
                            }
                            className="w-full border rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                            min={0}
                          />

                          <input
                            type="number"
                            value={set.reps || ''}
                            onChange={e =>
                              handleUpdateSet(exercise.id, set.id, 'reps', Number(e.target.value) || 0)
                            }
                            className="w-full border rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0"
                            min={0}
                          />

                          <div className="w-8 flex justify-center relative">
                            {syncingSets.has(set.id) ? (
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                            ) : (
                              <button
                                onClick={() => handleCheckSet(exercise.id, set.id)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                  set.completed
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-300 hover:border-green-500'
                                }`}
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
                        onClick={() => handleAddSet(exercise.id)}
                        className="mt-2 text-sm text-blue-500 hover:text-blue-700 font-medium"
                      >
                        + Add Set
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveSessionPage;
