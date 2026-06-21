import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Dumbbell, BarChart3, Target } from 'lucide-react';
import { usePlateauDetection } from '../../hooks/useAnalytics';
import { ErrorCard } from '../ui/ErrorCard';
import type { PlateauType } from '../../lib/analytics.types';

type CardType = 'strength' | 'volume' | 'consistency';

interface CardDef {
  type: CardType;
  label: string;
  icon: React.ReactNode;
}

const cardDefs: CardDef[] = [
  { type: 'strength', label: 'Strength', icon: <Dumbbell className="h-5 w-5" /> },
  { type: 'volume', label: 'Volume', icon: <BarChart3 className="h-5 w-5" /> },
  { type: 'consistency', label: 'Consistency', icon: <Target className="h-5 w-5" /> },
];

const getDismissKey = (): string => {
  const keys = Object.keys(sessionStorage);
  const match = keys.find((k) => k.startsWith('plateau-dismissed-'));
  return match ?? '';
};

const CardSkeleton = () => (
  <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5">
    <div className="flex items-center gap-3 mb-4">
      <div className="h-9 w-9 bg-aegis-border rounded-lg animate-pulse" />
      <div className="h-4 bg-aegis-border rounded w-24 animate-pulse" />
    </div>
    <div className="h-5 bg-aegis-border rounded w-20 mb-3 animate-pulse" />
    <div className="h-3 bg-aegis-dark rounded w-full mb-2 animate-pulse" />
    <div className="h-2 bg-aegis-dark rounded w-full animate-pulse" />
  </div>
);

interface ConfidenceBarProps {
  confidence: number;
}

const ConfidenceBar = ({ confidence }: ConfidenceBarProps) => (
  <div className="w-full h-2 bg-aegis-dark rounded-full overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(confidence, 100)}%` }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`h-full rounded-full ${
        confidence > 70
          ? 'bg-red-500'
          : confidence > 40
            ? 'bg-amber-500'
            : 'bg-emerald-500'
      }`}
    />
  </div>
);

interface StatusBadgeProps {
  isDetected: boolean;
}

const StatusBadge = ({ isDetected }: StatusBadgeProps) => {
  if (isDetected) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400">
        Plateau
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
      Growing
    </span>
  );
};

export const PlateauDetectionSection = () => {
  const { data, isLoading, isError, error, refetch } = usePlateauDetection();
  const [dismissed, setDismissed] = useState(() => !!getDismissKey());

  const handleDismiss = () => {
    sessionStorage.setItem(`plateau-dismissed-${Date.now()}`, 'true');
    setDismissed(true);
  };

  const showBanner = useMemo(() => {
    if (!data) return false;
    return data.plateauDetected === true && (data.confidence ?? 0) > 60 && !dismissed;
  }, [data, dismissed]);

  const detectedType: PlateauType | null = useMemo(() => {
    if (!data?.plateauDetected || !data.plateauType) return null;
    return data.plateauType;
  }, [data]);

  if (isError) {
    return (
      <ErrorCard
        title="Failed to load plateau detection"
        message={error?.message || 'Could not fetch plateau data.'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-amber-900/30 border border-amber-800/50 rounded-xl p-4 flex items-start gap-3 overflow-hidden"
          >
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-300">Plateau Detected</p>
              <p className="text-sm text-amber-400/80 mt-1">
                {data?.explanation ?? 'A plateau has been detected in your training progress.'}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="shrink-0 p-1 rounded-lg text-amber-400 hover:bg-amber-800/30 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              aria-label="Dismiss plateau notification"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          : cardDefs.map((card) => {
              const isDetected = detectedType === card.type;
              const confidence = isDetected ? (data?.confidence ?? 0) : 0;
              const explanation = isDetected ? data?.explanation : undefined;

              return (
                <motion.div
                  key={card.type}
                  layout
                  className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-9 w-9 bg-aegis-gold/10 rounded-lg flex items-center justify-center text-aegis-gold">
                      {card.icon}
                    </div>
                    <span className="text-sm font-medium text-white">{card.label}</span>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <StatusBadge isDetected={isDetected} />
                    {isDetected && (
                      <span className="text-xs text-aegis-muted">{confidence}% confidence</span>
                    )}
                  </div>

                  {isDetected && explanation && (
                    <p className="text-sm text-aegis-muted mb-3">{explanation}</p>
                  )}

                  {isDetected && <ConfidenceBar confidence={confidence} />}
                </motion.div>
              );
            })}
      </div>
    </div>
  );
};
