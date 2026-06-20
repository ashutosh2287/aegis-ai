import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { workoutService } from '../lib/workout.service';
import type { Workout, WorkoutExercise } from '../lib/workout.types';

/**
 * Hook to manage workouts
 * @returns Object containing workouts data and mutation functions
 */
export const useWorkouts = () => {
  const queryClient = useQueryClient();

  // Fetch all workouts
  const { data: workouts = [], isLoading, error } = useQuery<Workout[], Error>({
    queryKey: ['workouts'],
    queryFn: workoutService.getWorkouts,
  });

  // Mutation to create a new workout
  const createWorkoutMutation = useMutation({
    mutationFn: (workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) =>
      workoutService.createWorkout(workoutData),
    onSuccess: () => {
      // Invalidate and refetch workouts
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });

  // Mutation to add an exercise to a workout
  const addWorkoutExerciseMutation = useMutation({
    mutationFn: ({
      workoutId,
      exerciseData,
    }: {
      workoutId: string;
      exerciseData: Omit<WorkoutExercise, 'id' | 'workoutId'>;
    }) => workoutService.addWorkoutExercise(workoutId, exerciseData),
    onSuccess: (_, { workoutId }) => {
      // Invalidate workouts to refetch the updated workout with its exercises
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      // Optionally, we could invalidate a specific workout if we had a workout query
      queryClient.invalidateQueries({ queryKey: ['workout', workoutId] });
    },
  });

  return {
    workouts,
    isLoading,
    error,
    createWorkout: createWorkoutMutation.mutateAsync,
    addWorkoutExercise: addWorkoutExerciseMutation.mutateAsync,
    // For backward compatibility or if you prefer the mutation objects
    createWorkoutMutation,
    addWorkoutExerciseMutation,
  };
};