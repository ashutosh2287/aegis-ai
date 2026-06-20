export type ComparativePeriod = 'week' | 'month';

export interface VolumeComparison {
  totalVolume: number;
  totalSets: number;
  totalReps: number;
}

export interface WorkoutVolumeComparison {
  currentWeek: VolumeComparison;
  previousWeek: VolumeComparison;
  changePercentage: number;
}

export interface MonthlyVolumeComparison {
  currentMonth: VolumeComparison;
  previousMonth: VolumeComparison;
  changePercentage: number;
}

export interface FrequencyComparison {
  currentWeek: number;
  previousWeek: number;
  changePercentage: number;
}

export interface MonthlyFrequencyComparison {
  currentMonth: number;
  previousMonth: number;
  changePercentage: number;
}

export interface PRCountComparison {
  currentWeek: number;
  previousWeek: number;
  changePercentage: number;
}

export interface MonthlyPRCountComparison {
  currentMonth: number;
  previousMonth: number;
  changePercentage: number;
}

export interface WorkoutConsistency {
  currentStreak: number;
  longestStreak: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  averageWorkoutsPerWeek: number;
  adherencePercentage: number;
  totalWorkoutDays: number;
}

export type PersonalRecordType =
  | 'HEAVIEST_WEIGHT'
  | 'MOST_REPS'
  | 'HIGHEST_VOLUME'
  | 'LONGEST_SESSION'
  | 'MOST_SETS';

export interface PersonalRecord {
  type: PersonalRecordType;
  value: number;
  achievedAt: string | null;
  exerciseId?: string;
  sessionId?: string;
}

export interface ComparativeAnalytics {
  workoutVolume: WorkoutVolumeComparison;
  monthlyVolume: MonthlyVolumeComparison;
  workoutFrequencyWeekly: FrequencyComparison;
  workoutFrequencyMonthly: MonthlyFrequencyComparison;
  personalRecordsWeekly: PRCountComparison;
  personalRecordsMonthly: MonthlyPRCountComparison;
  currentConsistency: WorkoutConsistency;
  recentPersonalRecords: PersonalRecord[];
}

export type PlateauType = 'strength' | 'volume' | 'consistency';

export interface PlateauDetection {
  plateauDetected: boolean;
  plateauType?: PlateauType;
  confidence?: number;
  explanation?: string;
}

export type RecommendationPriority = 'low' | 'medium' | 'high';

export interface Recommendation {
  category: string;
  priority: RecommendationPriority;
  recommendation: string;
  rationale: string;
}
