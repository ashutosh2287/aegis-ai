import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { exerciseService } from '../lib/exercise.service';
import { useWorkouts } from '../hooks/useWorkouts';
import { useToast } from '../hooks/useToast';
import type { Exercise } from '../lib/exercise.types';

const DEBOUNCE_MS = 300;

function useDebouncedValue(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    timer.current = setTimeout(() => setDebounced(value), delay);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value, delay]);

  return debounced;
}

interface SortableExercise {
  id: string;
  name: string;
  muscleGroup: string;
  setCount: number;
}

function SortableExerciseItem({
  exercise,
  onIncrement,
  onDecrement,
  onRemove,
}: {
  exercise: SortableExercise;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-aegis-border rounded-lg p-3 sm:p-4 mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-aegis-charcoal"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-aegis-muted hover:text-white touch-none shrink-0"
          aria-label="Drag to reorder"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="7" cy="4" r="1.5" />
            <circle cx="13" cy="4" r="1.5" />
            <circle cx="7" cy="10" r="1.5" />
            <circle cx="13" cy="10" r="1.5" />
            <circle cx="7" cy="16" r="1.5" />
            <circle cx="13" cy="16" r="1.5" />
          </svg>
        </button>
        <div className="min-w-0">
          <h3 className="font-semibold text-white truncate">{exercise.name}</h3>
          <p className="text-sm text-aegis-muted">{exercise.muscleGroup}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        <button
          onClick={() => onDecrement(exercise.id)}
          disabled={exercise.setCount === 1}
          className="px-3 py-1 bg-aegis-dark hover:bg-aegis-border rounded disabled:opacity-50 text-white"
          aria-label={`Decrease sets for ${exercise.name}`}
        >
          -
        </button>
        <span className="w-8 text-center text-white" aria-label={`${exercise.setCount} sets`}>{exercise.setCount}</span>
        <button
          onClick={() => onIncrement(exercise.id)}
          disabled={exercise.setCount === 20}
          className="px-3 py-1 bg-aegis-dark hover:bg-aegis-border rounded disabled:opacity-50 text-white"
          aria-label={`Increase sets for ${exercise.name}`}
        >
          +
        </button>
        <button
          onClick={() => onRemove(exercise.id)}
          className="text-red-400 hover:text-red-300 text-sm"
          aria-label={`Remove ${exercise.name} from workout`}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

const WorkoutBuilderPage = () => {
  const navigate = useNavigate();
  const { createWorkout, addWorkoutExercise } = useWorkouts();
  const { showToast } = useToast();

  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Array<{
    id: string;
    name: string;
    muscleGroup: string;
    setCount: number;
  }>>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebouncedValue(searchQuery, DEBOUNCE_MS);

  const { data: searchResults = [], isLoading: searchLoading, error: searchError, isFetched } = useQuery<Exercise[], Error>({
    queryKey: ['exerciseSearch', debouncedQuery],
    queryFn: () => exerciseService.searchExercises(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const isWorkoutNameValid = workoutName.length >= 3;

  const handleIncrementSet = (id: string) => {
    setExercises(prev =>
      prev.map(exercise =>
        exercise.id === id
          ? { ...exercise, setCount: Math.min(exercise.setCount + 1, 20) }
          : exercise
      )
    );
  };

  const handleDecrementSet = (id: string) => {
    setExercises(prev =>
      prev.map(exercise =>
        exercise.id === id
          ? { ...exercise, setCount: Math.max(exercise.setCount - 1, 1) }
          : exercise
      )
    );
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(prev => prev.filter(exercise => exercise.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setExercises(prev => {
      const oldIndex = prev.findIndex(e => e.id === active.id);
      const newIndex = prev.findIndex(e => e.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleSaveWorkout = async () => {
    if (!isWorkoutNameValid || exercises.length === 0) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const workout = await createWorkout({ name: workoutName });

      for (let i = 0; i < exercises.length; i++) {
        await addWorkoutExercise({
          workoutId: workout.id,
          exerciseData: {
            exerciseId: exercises[i].id,
            order: i + 1,
            defaultSets: exercises[i].setCount,
          },
        });
      }

      navigate('/app/workouts');
      showToast('Workout saved successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save workout';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    if (exercises.some((e) => e.id === exercise.id)) return;
    setExercises((prev) => [
      ...prev,
      {
        id: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup ?? 'Unknown',
        setCount: 3,
      },
    ]);
  };

  const isAlreadyAdded = (id: string) => exercises.some((e) => e.id === id);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-4">Workout Builder</h1>

      {/* Workout Name Field */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">Workout Name</label>
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          className={`block w-full px-4 py-2 bg-aegis-dark border rounded-md text-white placeholder:text-aegis-muted ${
            !isWorkoutNameValid && workoutName.length > 0 ? 'border-red-500' : 'border-aegis-border'
          } focus:outline-none focus:ring-2 focus:ring-aegis-gold`}
          placeholder="Enter workout name (minimum 3 characters)"
        >
        </input>
        {!isWorkoutNameValid && workoutName.length > 0 && (
          <p className="text-xs text-red-400 mt-1">
            Workout name must be at least 3 characters long
          </p>
        )}
      </div>

      {/* Selected Exercises Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white mb-4">Selected Exercises</h2>
        {exercises.length === 0 ? (
          <p className="text-aegis-muted">No exercises added yet</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={exercises.map(e => e.id)} strategy={verticalListSortingStrategy}>
              <AnimatePresence>
                {exercises.map(exercise => (
                  <motion.div
                    key={exercise.id}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                  >
                    <SortableExerciseItem
                      exercise={exercise}
                      onIncrement={handleIncrementSet}
                      onDecrement={handleDecrementSet}
                      onRemove={handleRemoveExercise}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Exercise Search Panel */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white mb-4">Search Exercises</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full px-4 py-2 bg-aegis-dark border border-aegis-border rounded-md text-white placeholder:text-aegis-muted focus:outline-none focus:ring-2 focus:ring-aegis-gold"
          placeholder="Search exercises by name..."
        />
        {searchQuery.trim() && (
          <div className="mt-3 border border-aegis-border rounded-lg divide-y divide-aegis-border max-h-64 overflow-y-auto">
            {searchLoading && (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="h-4 bg-aegis-border rounded w-32 animate-pulse" />
                      <div className="h-3 bg-aegis-dark rounded w-24 animate-pulse" />
                    </div>
                    <div className="h-7 bg-aegis-border rounded w-12 animate-pulse" />
                  </div>
                ))}
              </div>
            )}
            {!searchLoading && searchError && (
              <div className="p-4 text-center">
                <p className="text-red-400 text-sm mb-2">Failed to search exercises</p>
                <p className="text-aegis-muted text-xs">{searchError.message || 'Please try again.'}</p>
              </div>
            )}
            {!searchLoading && !searchError && isFetched && searchResults.length === 0 && (
              <p className="p-4 text-aegis-muted text-sm">No exercises found</p>
            )}
            {!searchLoading && !searchError && isFetched && searchResults.map((exercise) => (
              <div
                key={exercise.id}
                className="p-4 flex justify-between items-center hover:bg-aegis-dark"
              >
                <div>
                  <p className="font-medium text-white">{exercise.name}</p>
                  <p className="text-sm text-aegis-muted">
                    {exercise.muscleGroup}
                    {exercise.equipment && ` · ${exercise.equipment}`}
                  </p>
                </div>
                <button
                  onClick={() => handleAddExercise(exercise)}
                  disabled={isAlreadyAdded(exercise.id)}
                  className="px-3 py-1 bg-aegis-gold text-aegis-black text-sm rounded hover:bg-aegis-gold-light disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-aegis-gold focus:ring-offset-1"
                  aria-label={isAlreadyAdded(exercise.id) ? `${exercise.name} already added` : `Add ${exercise.name} to workout`}
                >
                  {isAlreadyAdded(exercise.id) ? 'Added' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      {saveError && (
        <p className="text-red-400 text-sm mb-3">{saveError}</p>
      )}
      <button
        onClick={handleSaveWorkout}
        disabled={!isWorkoutNameValid || exercises.length === 0 || isSaving}
        className={`bg-aegis-gold hover:bg-aegis-gold-light text-aegis-black font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-aegis-gold focus:ring-offset-2 shadow-[0_0_20px_rgba(212,168,67,0.15)] ${
          !isWorkoutNameValid || exercises.length === 0 || isSaving ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSaving ? 'Saving...' : 'Save Workout'}
      </button>
    </div>
  );
};

export default WorkoutBuilderPage;