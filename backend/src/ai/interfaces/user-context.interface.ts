export interface UserProfileContext {
  id: string;
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  goals: string[];
  experienceLevel: string;
  equipment: string[];
  targetDaysPerWeek: number | null;
  trainingYears: number;
  primaryGoal: string | null;
  preferredUnits: string;
}

export interface WorkoutHistoryContext {
  recentWorkouts: WorkoutSummary[];
  trainingFrequency: number;
  volumeMetrics: VolumeMetrics;
}

export interface WorkoutSummary {
  id: string;
  name: string;
  completedAt: string;
  durationSeconds: number | null;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  exercises: WorkoutExerciseSummary[];
}

export interface WorkoutExerciseSummary {
  exerciseName: string;
  sets: { weight: number | null; reps: number }[];
}

export interface VolumeMetrics {
  weeklyVolume: number;
  monthlyVolume: number;
  averageVolumePerWorkout: number;
  totalWorkouts: number;
}

export interface AnalyticsContext {
  strengthTrends: StrengthTrend;
  volumeTrends: VolumeTrend;
  consistency: ConsistencyMetrics;
}

export interface StrengthTrend {
  currentOneRepMax: number;
  bestOneRepMax: number;
  improvementPercentage: number;
  trend: 'UPWARD' | 'DOWNWARD' | 'STABLE';
}

export interface VolumeTrend {
  weeklyVolume: number;
  monthlyVolume: number;
  averageSetsPerWorkout: number;
}

export interface ConsistencyMetrics {
  currentStreak: number;
  longestStreak: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  averageWorkoutsPerWeek: number;
}

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  description: string | null;
  muscleGroups: string[];
  equipmentNeeded: string[];
  movementPattern: string;
  difficulty: string;
}
