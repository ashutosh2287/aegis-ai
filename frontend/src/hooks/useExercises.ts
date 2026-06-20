import { useQuery, useQueryClient } from '@tanstack/react-query';
import { exerciseService } from '../lib/exercise.service';
import type { Exercise } from '../lib/exercise.types';
import type { StrengthTrend } from '../lib/exercise.types';

/**
 * Hook to manage exercises
 * @returns Object containing exercises data and helper functions
 */
export const useExercises = () => {
  const queryClient = useQueryClient();

  // Fetch all exercises (with default pagination, can be adjusted)
  const {
    data: exercises = [],
    isLoading: exercisesLoading,
    error: exercisesError,
    refetch: refetchExercises,
  } = useQuery<Exercise[], Error>({
    queryKey: ['exercises'],
    queryFn: () => exerciseService.getExercises(),
  });

  /**
   * Search exercises by query
   * @param query - Search term
   * @returns Promise resolving to array of exercises
   */
  const searchExercises = async (query: string): Promise<Exercise[]> => {
    const response = await exerciseService.searchExercises(query);
    return response;
  };

  /**
   * Get strength trend for an exercise
   * @param exerciseId - The exercise ID
   * @param limit - Optional limit for data points
   * @returns Promise resolving to strength trend object
   */
  const getStrengthTrend = async (
    exerciseId: string,
    limit?: number
  ): Promise<StrengthTrend> => {
    const response = await exerciseService.getStrengthTrend(exerciseId, limit);
    return response;
  };

  // Function to invalidate and refetch the exercises list
  const invalidateExercises = async () => {
    await queryClient.invalidateQueries({ queryKey: ['exercises'] });
    return refetchExercises();
  };

  return {
    exercises,
    exercisesLoading,
    exercisesError,
    searchExercises,
    getStrengthTrend,
    invalidateExercises,
    refetchExercises,
  };
};