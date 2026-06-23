export type GoalType = 'strength' | 'volume' | 'frequency';

export type GoalStatus = 'on_track' | 'at_risk' | 'behind' | 'achieved' | 'expired';

export const ExperienceLevel = {
  NEW: 'new',
  FEW_MONTHS: 'few_months',
  ONE_YEAR: 'one_year',
  YEARS: 'years',
  COMPETITOR: 'competitor',
} as const;

export type ExperienceLevel = (typeof ExperienceLevel)[keyof typeof ExperienceLevel];

export const WeightUnit = {
  METRIC: 'metric',
  IMPERIAL: 'imperial',
} as const;

export type WeightUnit = (typeof WeightUnit)[keyof typeof WeightUnit];

export interface GoalProjection {
  goalId: string;
  exerciseId: string;
  exerciseName: string;
  goalType: GoalType;
  targetValue: number;
  currentValue: number;
  progressPercentage: number;
  status: GoalStatus;
  projectedCompletionDate: string | null;
  startDate: string;
  deadline: string | null;
  daysRemaining: number | null;
  weeklyRate: number;
  requiredWeeklyRate: number | null;
}

export interface FrequencyWeek {
  weekLabel: string;
  sessions: number;
  target: number;
}

export interface ForecastHistoryPoint {
  date: string;
  actualValue: number | null;
  forecastValue: number;
  lowerBound: number;
  upperBound: number;
}

export interface ForecastRecommendation {
  exerciseId: string;
  exerciseName: string;
  goalType: GoalType;
  currentTrajectory: string;
  suggestedAdjustment: string;
  confidenceScore: number;
  reasoning: string;
}
