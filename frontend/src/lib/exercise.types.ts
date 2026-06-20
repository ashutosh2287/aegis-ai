export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroup?: string;
  equipment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionSummary {
  id: string;
  workoutSessionId: string;
  workoutName: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  totalVolume: number; // total weight * reps across all sets
  status: 'completed' | 'active' | 'cancelled';
  createdAt: string;
}

export interface StrengthTrend {
  exerciseId: string;
  exerciseName: string;
  // Array of data points for each session where this exercise was performed
  dataPoints: {
    sessionId: string;
    sessionDate: string; // ISO string
    averageWeight: number; // average weight across sets for this session
    totalVolume: number; // total weight * reps for this session
  }[];
}