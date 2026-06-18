import { ApiProperty } from "@nestjs/swagger";

export class DashboardResponseDto {
  @ApiProperty()
  streaks: { current: number; longest: number };

  @ApiProperty()
  workouts: { weekly: number; monthly: number; total: number };

  @ApiProperty()
  trainingVolume: { weekly: number; monthly: number };

  @ApiProperty()
  personalRecords: {
    heaviestWeight: number | null;
    mostReps: number | null;
    highestVolume: number | null;
    longestSession: number | null;
  };

  @ApiProperty()
  strengthProgress: {
    overallImprovementPercentage: number;
    trackedExercises: string[];
  };

  @ApiProperty({ type: [Object] })
  recentSessions: Array<{
    id: string;
    date: string; // ISO date string
    duration: number; // in seconds
    exerciseCount: number;
  }>;

  @ApiProperty()
  generatedAt: string; // ISO timestamp

  constructor(
    streaks: { current: number; longest: number },
    workouts: { weekly: number; monthly: number; total: number },
    trainingVolume: { weekly: number; monthly: number },
    personalRecords: {
      heaviestWeight: number | null;
      mostReps: number | null;
      highestVolume: number | null;
      longestSession: number | null;
    },
    strengthProgress: {
      overallImprovementPercentage: number;
      trackedExercises: string[];
    },
    recentSessions: Array<{
      id: string;
      date: string;
      duration: number;
      exerciseCount: number;
    }>,
    generatedAt: string,
  ) {
    this.streaks = streaks;
    this.workouts = workouts;
    this.trainingVolume = trainingVolume;
    this.personalRecords = personalRecords;
    this.strengthProgress = strengthProgress;
    this.recentSessions = recentSessions;
    this.generatedAt = generatedAt;
  }
}
