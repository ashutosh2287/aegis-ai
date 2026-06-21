export interface WorkoutConsistency {
  currentStreak: number;
  longestStreak: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  averageWorkoutsPerWeek: number;
  adherencePercentage: number;
  totalWorkoutDays: number;
}

export interface VolumeData {
  totalVolume: number;
  totalSets: number;
  totalReps: number;
}

export interface PersonalRecord {
  type: string;
  value: number;
  achievedAt: string | null;
  exerciseId?: string;
  sessionId?: string;
}

export interface DashboardData {
  workoutConsistency: WorkoutConsistency;
  weeklyVolume: VolumeData;
  monthlyVolume: VolumeData;
  personalRecords: PersonalRecord[];
}
