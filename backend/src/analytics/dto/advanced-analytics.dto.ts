
import { Exercise } from '@/exercise/interfaces/exercise.interface';

export interface HistoricalComparison {
  week: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  month: {
    current: number;
    previous: number;
    percentageChange: number;
  };
}

export interface PerformanceSummary {
  strongestExercise: {
    exerciseId: string;
    exerciseName: string;
    maxWeight: number;
  };
  mostImprovedExercise: {
    exerciseId: string;
    exerciseName: string;
    improvementPercentage: number;
  };
  mostFrequentExercise: {
    exerciseId: string;
    exerciseName: string;
    frequency: number;
  };
  totalLifetimeVolume: number;
}

export interface TrendAnalysis {
  volumeTrend: Array<{
    date: string;
    volume: number;
  }>;
  strengthTrend: Array<{
    date: string;
    strength: number;
  }>;
  consistencyTrend: Array<{
    date: string;
    consistencyScore: number;
  }>;
}

export interface AdvancedAnalyticsDto {
  historicalComparison: HistoricalComparison;
  performanceSummary: PerformanceSummary;
  trendAnalysis: TrendAnalysis;
}

