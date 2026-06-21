import { TrendingUp } from 'lucide-react';

interface EmptyForecastStateProps {
  onLearnMore?: () => void;
}

export function EmptyForecastState({ onLearnMore }: EmptyForecastStateProps) {
  return (
    <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-8 text-center">
      <div className="h-12 w-12 bg-aegis-dark rounded-full flex items-center justify-center mx-auto mb-4">
        <TrendingUp className="h-6 w-6 text-aegis-muted" />
      </div>
      <h3 className="text-sm font-medium text-white mb-1">Forecast unavailable</h3>
      <p className="text-xs text-aegis-muted mb-4 max-w-xs mx-auto">
        Not enough logged sessions to generate a forecast. Keep training to build your data.
      </p>
      {onLearnMore && (
        <button
          onClick={onLearnMore}
          className="text-sm font-medium text-aegis-gold hover:text-aegis-gold-light transition-colors"
        >
          Learn how forecasts work
        </button>
      )}
    </div>
  );
}
