import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorCard({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className = '',
}: ErrorCardProps) {
  return (
    <div className={`bg-aegis-charcoal rounded-xl border border-aegis-border p-6 ${className}`}>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="h-12 w-12 bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-aegis-muted mb-4 max-w-xs">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-aegis-black bg-aegis-gold rounded-lg hover:bg-aegis-gold-light transition-colors focus:outline-none focus:ring-2 focus:ring-aegis-gold focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
