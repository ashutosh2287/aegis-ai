import { useState } from 'react';
import { useWorkouts } from './useWorkouts';
import type { WorkoutExercise } from '../lib/workout.types';

/**
 * Hook to build a workout before saving
 * @returns Object with workout builder state and actions
 */
export const useWorkoutBuilder = () => {
  const { createWorkout, addWorkoutExercise } = useWorkouts();

  // Local state for the workout being built
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<
    Omit<WorkoutExercise, 'id' | 'workoutId'>[]
  >([]);

  // Add an exercise to the builder
  const addExercise = (exercise: Omit<WorkoutExercise, 'id' | 'workoutId'>) => {
    setExercises((prev) => [...prev, exercise]);
  };

  // Remove an exercise by index
  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  // Update an exercise by index
  const updateExercise = (
    index: number,
    updates: Partial<Omit<WorkoutExercise, 'id' | 'workoutId'>>
  ) => {
    setExercises((prev) => {
      const newExercises = [...prev];
      if (newExercises[index]) {
        newExercises[index] = { ...newExercises[index], ...updates };
      }
      return newExercises;
    });
  };

  // Reset the builder
  const reset = () => {
    setName('');
    setDescription('');
    setExercises([]);
  };

  // Save the workout and its exercises
  const save = async () => {
    if (!name.trim()) {
      throw new Error('Workout name is required');
    }

    // Create the workout
    const workout = await createWorkout({
      name,
      description,
    });

    // Add each exercise to the workout
    for (const exerciseData of exercises) {
      await addWorkoutExercise({
        workoutId: workout.id,
        exerciseData,
      });
    }

    // Optionally, reset the builder after saving
    reset();

    return workout;
  };

  return {
    // State
    name,
    description,
    exercises,
    // Setters
    setName,
    setDescription,
    // Exercise management
    addExercise,
    removeExercise,
    updateExercise,
    // Actions
    save,
    reset,
  };
};