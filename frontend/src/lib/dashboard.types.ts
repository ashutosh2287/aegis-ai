export interface HeatmapDay {
  date: string;
  trained: boolean;
}

export interface DashboardOverview {
  totalWorkouts: number;
  totalSessions: number;
  totalExercises: number;
  totalVolume: number;
  currentStreak: number;
  longestStreak: number;
  adherencePercentage: number;
  heatmapData: HeatmapDay[];
  lastWorkoutDate: string | null;
  memberSince: string;
}

export interface PerformanceDataPoint {
  date: string;
  sessionsCompleted: number;
  totalVolume: number;
  averageDuration: number;
}

export interface DashboardPerformance {
  period: string;
  dataPoints: PerformanceDataPoint[];
  summary: {
    totalVolume: number;
    averageSessionsPerWeek: number;
    volumeChangePercent: number;
    sessionsChangePercent: number;
  };
}

export interface HistoricalDataPoint {
  date: string;
  weight: number | null;
  reps: number | null;
  volume: number | null;
  oneRepMax: number | null;
}

export interface DashboardHistorical {
  exerciseId: string;
  exerciseName: string;
  dataPoints: HistoricalDataPoint[];
  personalRecords: {
    maxWeight: number;
    maxVolume: number;
    maxOneRepMax: number;
  };
  currentOneRepMax: number;
  oneRepMaxChangePercent: number;
}

export interface GoalSnapshot {
  id: string;
  name: string;
  progressPercent: number;
  estimatedCompletionDate: string;
}

export interface DashboardKPIs {
  totalVolumeThisWeek: number;
  totalVolumeLastWeek: number;
  volumeChangePercent: number;
  sessionsThisWeek: number;
  sessionsLastWeek: number;
  sessionsChangePercent: number;
  averageSessionDuration: number;
  mostPerformedExercise: string;
  totalSetsThisWeek: number;
  estimatedOneRepMax: number;
  goals: GoalSnapshot[];
}
