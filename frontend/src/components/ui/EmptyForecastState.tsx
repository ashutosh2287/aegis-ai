import { TrendingUp } from 'lucide-react';

interface EmptyForecastStateProps {
  onLearnMore?: () => void;
}

export function EmptyForecastState({ onLearnMore }: EmptyForecastStateProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
      <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <TrendingUp className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">Forecast unavailable</h3>
      <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
        Not enough logged sessions to generate a forecast. Keep training to build your data.
      </p>
      {onLearnMore && (
        <button
          onClick={onLearnMore}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Learn how forecasts work
        </button>
      )}
    </div>
  );
}
