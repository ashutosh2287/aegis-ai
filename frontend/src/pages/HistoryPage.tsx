import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useInfiniteSessionHistory } from '../hooks/useInfiniteSessionHistory';
import { ErrorCard } from '../components/ui/ErrorCard';
import type { SessionSummary } from '../lib/exercise.types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(startTime: string, endTime?: string): string {
  if (!endTime) return '--';
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const totalSeconds = Math.floor((end - start) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function formatVolume(volume: number): string {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k`;
  return volume.toLocaleString();
}

interface SessionRowProps {
  session: SessionSummary;
  onClick: () => void;
}

function SessionRow({ session, onClick }: SessionRowProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-colors text-left gap-2 sm:gap-4 cursor-pointer"
    >
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{session.workoutName}</p>
        <p className="text-sm text-gray-500 mt-0.5">{formatDate(session.startTime)}</p>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 sm:ml-4 shrink-0 text-sm">
        <div className="text-center">
          <p className="font-medium text-gray-900">
            {formatDuration(session.startTime, session.endTime)}
          </p>
          <p className="text-xs text-gray-500">Duration</p>
        </div>
        <div className="text-center sm:w-16">
          <p className="font-medium text-gray-900">{formatVolume(session.totalVolume)}</p>
          <p className="text-xs text-gray-500">Volume</p>
        </div>
        <div className="text-center sm:w-10">
          <p className="font-medium text-gray-900">{session.totalSets}</p>
          <p className="text-xs text-gray-500">Sets</p>
        </div>
      </div>
    </motion.button>
  );
}

export const HistoryPage = () => {
  const navigate = useNavigate();
  const {
    sessions,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useInfiniteSessionHistory();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">History</h1>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">History</h1>
        <ErrorCard
          title="Failed to load history"
          message={error.message || 'Could not fetch your workout history. Please try again.'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">History</h1>
        <div className="text-center py-16">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-1">No sessions yet</p>
          <p className="text-sm text-gray-500">Complete a workout to see your history here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">History</h1>
      <div className="space-y-3">
        {sessions.map((session: SessionSummary) => (
          <SessionRow
            key={session.id}
            session={session}
            onClick={() => navigate(`/app/session-summary/${session.workoutSessionId}`)}
          />
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
