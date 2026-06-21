import { useInfiniteQuery } from '@tanstack/react-query';
import { sessionService } from '../lib/session.service';
import type { SessionSummary } from '../lib/exercise.types';

const PAGE_SIZE = 20;

interface SessionHistoryPage {
  items: SessionSummary[];
  nextOffset: number | null;
}

export const useInfiniteSessionHistory = () => {
  const query = useInfiniteQuery<SessionHistoryPage, Error>({
    queryKey: ['workout-sessions'],
    queryFn: async ({ pageParam }) => {
      const items = await sessionService.getWorkoutSessions(PAGE_SIZE, pageParam as number);
      return {
        items,
        nextOffset: items.length === PAGE_SIZE ? (pageParam as number) + PAGE_SIZE : null,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });

  const sessions = query.data?.pages.flatMap((page) => page.items) ?? [];

  return {
    sessions,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
    refetch: query.refetch,
  };
};
