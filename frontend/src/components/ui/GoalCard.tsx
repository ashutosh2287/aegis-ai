import { Weight, TrendingUp, Calendar, Clock, Target } from 'lucide-react';
import { GoalStatusBadge } from './GoalStatusBadge';
import { ProgressBar } from './ProgressBar';
import { FrequencyMiniBars } from './FrequencyMiniBars';
import type { GoalProjection, GoalType, FrequencyWeek } from '../../lib/goals.types';

const TYPE_CONFIG: Record<
  GoalType,
  { label: string; icon: React.ComponentType<{ className?: string }>; format: (v: number) => string }
> = {
  strength: {
    label: 'Strength',
    icon: Weight,
    format: (v) => `${v} kg`,
  },
  volume: {
    label: 'Volume',
    icon: TrendingUp,
    format: (v) => `${v.toLocaleString()} kg`,
  },
  frequency: {
    label: 'Frequency',
    icon: Calendar,
    format: (v) => `${v} sessions/wk`,
  },
};

interface GoalCardProps {
  goal: GoalProjection;
  frequencyHistory?: FrequencyWeek[];
}

function StrengthStats({ goal }: { goal: GoalProjection }) {
  const config = TYPE_CONFIG.strength;
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <div className="space-y-0.5">
        <p className="text-[10px] text-aegis-muted uppercase tracking-wide">Current</p>
        <p className="text-sm font-semibold text-white">{config.format(goal.currentValue)}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] text-aegis-muted uppercase tracking-wide">Rate</p>
        <p className="text-sm font-semibold text-white">{goal.weeklyRate > 0 ? `+${goal.weeklyRate} kg/wk` : '—'}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] text-aegis-muted uppercase tracking-wide">ETA</p>
        <p className="text-sm font-semibold text-white">
          {goal.projectedCompletionDate
            ? new Date(goal.projectedCompletionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '—'}
        </p>
      </div>
    </div>
  );
}

function VolumeStats({ goal }: { goal: GoalProjection }) {
  const config = TYPE_CONFIG.volume;
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <div className="space-y-0.5">
        <p className="text-[10px] text-aegis-muted uppercase tracking-wide">Current</p>
        <p className="text-sm font-semibold text-white">{config.format(goal.currentValue)}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] text-aegis-muted uppercase tracking-wide">Rate</p>
        <p className="text-sm font-semibold text-white">{goal.weeklyRate > 0 ? `+${goal.weeklyRate.toLocaleString()} kg/wk` : '—'}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] text-aegis-muted uppercase tracking-wide">ETA</p>
        <p className="text-sm font-semibold text-white">
          {goal.projectedCompletionDate
            ? new Date(goal.projectedCompletionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '—'}
        </p>
      </div>
    </div>
  );
}

function FrequencyStats({ goal, frequencyHistory }: { goal: GoalProjection; frequencyHistory: FrequencyWeek[] }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="space-y-0.5">
          <p className="text-[10px] text-aegis-muted uppercase tracking-wide">Current</p>
          <p className="text-sm font-semibold text-white">{goal.currentValue} sessions/wk</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] text-aegis-muted uppercase tracking-wide">Target</p>
          <p className="text-sm font-semibold text-white">{goal.targetValue} sessions/wk</p>
        </div>
      </div>
      {frequencyHistory.length > 0 && <FrequencyMiniBars weeks={frequencyHistory} />}
    </div>
  );
}

export function GoalCardSkeleton() {
  return (
    <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 bg-aegis-border rounded-lg animate-pulse shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-aegis-border rounded w-28 animate-pulse" />
            <div className="h-3 bg-aegis-dark rounded w-36 animate-pulse" />
          </div>
        </div>
        <div className="h-5 bg-aegis-border rounded-full w-16 animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-2 bg-aegis-dark rounded-full animate-pulse" />
        <div className="flex justify-between">
          <div className="h-3 bg-aegis-dark rounded w-20 animate-pulse" />
          <div className="h-3 bg-aegis-dark rounded w-8 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-2.5 bg-aegis-dark rounded w-12 mx-auto animate-pulse" />
            <div className="h-4 bg-aegis-border rounded w-16 mx-auto animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GoalCard({ goal, frequencyHistory = [] }: GoalCardProps) {
  const config = TYPE_CONFIG[goal.goalType];
  const Icon = config.icon;

  return (
    <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-lg bg-aegis-gold/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-aegis-gold" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {goal.exerciseName}
            </p>
            <p className="text-xs text-aegis-muted">
              {config.label} Goal · Target {config.format(goal.targetValue)}
            </p>
          </div>
        </div>
        <GoalStatusBadge status={goal.status} />
      </div>

      <div className="space-y-2">
        <ProgressBar progress={goal.progressPercentage} />
        <div className="flex items-center justify-between text-xs text-aegis-muted">
          <span>Progress</span>
          <span>{goal.progressPercentage.toFixed(0)}%</span>
        </div>
      </div>

      {goal.goalType === 'strength' && <StrengthStats goal={goal} />}
      {goal.goalType === 'volume' && <VolumeStats goal={goal} />}
      {goal.goalType === 'frequency' && (
        <FrequencyStats goal={goal} frequencyHistory={frequencyHistory} />
      )}

      {goal.daysRemaining !== null && (
        <div className="flex items-center justify-between text-xs text-aegis-muted pt-2 border-t border-aegis-border">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {goal.daysRemaining > 0
              ? `${goal.daysRemaining} days remaining`
              : 'Deadline passed'}
          </span>
          {goal.projectedCompletionDate && (
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {new Date(goal.projectedCompletionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
