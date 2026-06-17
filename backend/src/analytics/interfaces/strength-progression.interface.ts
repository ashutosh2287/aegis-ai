export interface StrengthProgression {
  exerciseId: string;
  currentOneRepMax: number;
  bestOneRepMax: number;
  improvementPercentage: number;
  trend: 'UPWARD' | 'DOWNWARD' | 'STABLE';
  totalWorkouts: number;
}

export interface StrengthTrendHistoryItem {
  date: string; // ISO date string, e.g., '2026-06-01'
  oneRepMax: number;
}

export interface StrengthTrendResponse {
  exerciseId: string;
  history: StrengthTrendHistoryItem[];
}