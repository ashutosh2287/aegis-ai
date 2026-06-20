import { useState, useEffect } from 'react';
import { useExercises } from '../hooks/useExercises';
import { workoutService } from '../lib/workout.service';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { closestCenter } from '@dnd-kit/core';
import ExerciseSearchPanel from './ExerciseSearchPanel';
import WorkoutDropZone from './WorkoutDropZone';
import type { Exercise } from '../lib/exercise.types';

interface ExerciseWithSetCount extends Exercise {
  setCount: number;
}

const WorkoutBuilderPage = () => {
  const { searchExercises } = useExercises();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState<Exercise[]>([]);

  const [workoutName, setWorkoutName] = useState('');
  const [workoutNameError, setWorkoutNameError] = useState<string | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<ExerciseWithSetCount[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);



  const handleWorkoutNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWorkoutName(value);
    if (workoutNameError) {
      setWorkoutNameError(null);
    }
  };

  const validateWorkoutName = (): boolean => {
    if (!workoutName.trim()) {
      setWorkoutNameError('Workout name is required');
      return false;
    }
    if (workoutName.trim().length < 3) {
      setWorkoutNameError('Workout name must be at least 3 characters');
      return false;
    }
    setWorkoutNameError(null);
    return true;
  };

  const handleAddExerciseFromSearch = (exercise: Exercise) => {
    setWorkoutExercises(prev => [...prev, { ...exercise, setCount: 1 }]);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setWorkoutExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const handleSetCountChange = (exerciseId: string, delta: number) => {
    setWorkoutExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? { ...ex, setCount: Math.min(Math.max(ex.setCount + delta, 1), 20) }
          : ex
      )
    );
  };

  const handleExerciseReorder = (oldIndex: number, newIndex: number) => {
    setWorkoutExercises(prev => {
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered;
    });
  };

  const handleSaveWorkout = async () => {
    if (!validateWorkoutName()) {
      return;
    }

    if (workoutExercises.length === 0) {
      setSaveError('Please add at least one exercise to the workout');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // 1. Create the workout
      const workout = await workoutService.createWorkout({
        name: workoutName.trim(),
        description: '',
      });

      // 2. Add each exercise to the workout in order
      for (const [index, exercise] of workoutExercises.entries()) {
        await workoutService.addWorkoutExercise(workout.id, {
          exerciseId: exercise.id,
          order: index,
          defaultSets: exercise.setCount,
        });
      }

      // 3. Invalidate workouts cache
      await queryClient.invalidateQueries({ queryKey: ['workouts'] });

      // 4. Navigate to workouts page
      navigate('/app/workouts');
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Failed to save workout'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    // Check if dropped from search to drop zone (adding exercise)
    if (activeIdStr.startsWith('search-') && overIdStr === 'drop-zone') {
      const exerciseId = activeIdStr.split('-')[1];
      const exercise = searchResults.find(ex => ex.id === exerciseId);
      if (exercise) {
        handleAddExerciseFromSearch(exercise);
      }
      return;
    }

    // Check if dropped within workout list (reordering)
    if (
      activeIdStr.startsWith('exercise-') &&
      overIdStr.startsWith('exercise-')
    ) {
      const activeIndex = Number(activeIdStr.split('-')[1]);
      const overIndex = Number(overIdStr.split('-')[1]);
      if (!isNaN(activeIndex) && !isNaN(overIndex)) {
        handleExerciseReorder(activeIndex, overIndex);
      }
      return;
    }
  };

  if (isSaving) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Build Workout</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Saving workout...</p>
          {saveError && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-3">
              <p>{saveError}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
        <div className="flex flex-col md:flex-row min-h-screen">
          {/* Left Panel: Exercise Search */}
          <div className="md:w-2/5 p-4 md:p-6 space-y-4 bg-white md:border-r border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Search Exercises</h2>
            </div>
            <ExerciseSearchPanel />
          </div>

          {/* Right Panel: Workout Builder */}
          <div className="md:w-3/5 p-4 md:p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Workout Builder</h2>
            </div>
            <div className="space-y-4">
              {/* Workout Name Input */}
              <div>
                <label className="block text-sm font-medium mb-1">Workout Name</label>
                <input
                  type="text"
                  value={workoutName}
                  onChange={handleWorkoutNameChange}
                  className={`${workoutNameError ? 'border-red-500' : ''} w-full pl-3 pr-1 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {workoutNameError && (
                  <p className="mt-1 text-sm text-red-600">{workoutNameError}</p>
                )}
              </div>

              {/* Exercise Drop Zone */}
              <WorkoutDropZone
                exercises={workoutExercises}
                onExerciseRemove={handleRemoveExercise}
                onSetCountChange={handleSetCountChange}
              />

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSaveWorkout}
                  disabled={isSaving || workoutName.trim().length < 3 || workoutExercises.length === 0}
                  className="w-fit px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Workout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
};

export default WorkoutBuilderPage;