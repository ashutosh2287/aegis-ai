import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { sessionService } from '../lib/session.service';
import type { WorkoutSession, WorkoutSet } from '../lib/session.types';

/**
 * Hook to manage a workout session
 * @param sessionId - The ID of the session to fetch
 * @returns Object containing session data and mutation functions
 */
export const useSession = (sessionId: string) => {
  const queryClient = useQueryClient();

  // Fetch the session
  const {
    data: session,
    isLoading,
    error,
  } = useQuery<WorkoutSession, Error>({
    queryKey: ['session', sessionId],
    queryFn: () => sessionService.getSession(sessionId),
    enabled: !!sessionId,
  });

  // Mutation to complete a session
  const completeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => sessionService.completeSession(sessionId),
    onSuccess: () => {
      // Invalidate the session query
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      // Also invalidate session history if applicable
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  // Mutation to update a workout set
  const updateWorkoutSetMutation = useMutation({
    mutationFn: ({
      sessionId,
      sessionExerciseId,
      setId,
      setData,
    }: {
      sessionId: string;
      sessionExerciseId: string;
      setId: string;
      setData: Partial<Omit<WorkoutSet, 'id' | 'sessionExerciseId'>>;
    }) =>
      sessionService.updateWorkoutSet(
        sessionId,
        sessionExerciseId,
        setId,
        setData
      ),
    onSuccess: (_, variables) => {
      // Invalidate the session to refetch with updated set
      queryClient.invalidateQueries({ queryKey: ['session', variables.sessionId] });
    },
  });

  return {
    session,
    isLoading,
    error,
    completeSession: completeSessionMutation.mutateAsync,
    updateWorkoutSet: updateWorkoutSetMutation.mutateAsync,
    // For backward compatibility
    completeSessionMutation,
    updateWorkoutSetMutation,
  };
};