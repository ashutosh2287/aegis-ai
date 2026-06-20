import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sessionService } from '../lib/session.service';
import type { SessionSummary } from '../lib/exercise.types';

/**
 * Hook to fetch session history
 * @param limit - Optional limit for number of sessions
 * @param offset - Optional offset for pagination
 * @returns Object containing session history data
 */
export const useHistory = (limit?: number, offset?: number) => {
  const queryClient = useQueryClient();

  const {
    data: history = [],
    isLoading,
    error,
    refetch,
  } = useQuery<SessionSummary[], Error>({
    queryKey: ['history', limit, offset],
    queryFn: () => sessionService.getSessionHistory(limit, offset),
  });

  // Function to invalidate and refetch history (e.g., after completing a session)
  const invalidateAndRefetch = async () => {
    await queryClient.invalidateQueries({ queryKey: ['history'] });
    return refetch();
  };

  return {
    history,
    isLoading,
    error,
    refetch,
    invalidateAndRefetch,
  };
};