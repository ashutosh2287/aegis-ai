export interface Dashboard {
  streaks: {
    current: number;
    longest: number;
  };
  workouts: {
    weekly: number;
    monthly: number;
    total: number;
  };
  trainingVolume: {
    weekly: number;
    monthly: number;
  };
  personalRecords: {
    heaviestWeight: number | null;
    mostReps: number | null;
    highestVolume: number | null;
    longestSession: number | null;
  };
  strengthProgress: {
    overallImprovementPercentage: number;
    trackedExercises: string[]; // Array of exercise IDs
  };
  recentSessions: Array<{
    id: string;
    date: string; // ISO date string of session completion
    duration: number; // Duration in seconds
    exerciseCount: number;
  }>;
  generatedAt: string; // ISO timestamp of when data was generated
}
