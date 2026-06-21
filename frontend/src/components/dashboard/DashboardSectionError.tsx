import { AlertCircle, RefreshCw } from 'lucide-react';

interface DashboardSectionErrorProps {
  title: string;
  message?: string;
  onRetry?: () => void;
}

export const DashboardSectionError = ({
  title,
  message = 'Something went wrong. Please try again.',
  onRetry,
}: DashboardSectionErrorProps) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6 text-red-500" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  </div>
);
