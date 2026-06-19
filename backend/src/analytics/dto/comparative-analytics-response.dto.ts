import { ApiProperty } from '@nestjs/swagger';
import { WorkoutConsistency } from '../interfaces/workout-consistency.interface';
import { PersonalRecord } from '../interfaces/personal-record.interface';

export class ComparativeAnalyticsResponseDto {
  @ApiProperty({
    description: 'Comparison of workout volume metrics',
    example: {
      currentWeek: { totalVolume: 1000, totalSets: 50, totalReps: 200 },
      previousWeek: { totalVolume: 800, totalSets: 40, totalReps: 160 },
      changePercentage: 25.0
    }
  })
  workoutVolume: {
    currentWeek: { totalVolume: number; totalSets: number; totalReps: number };
    previousWeek: { totalVolume: number; totalSets: number; totalReps: number };
    changePercentage: number;
  };

  @ApiProperty({
    description: 'Comparison of monthly workout volume metrics',
    example: {
      currentMonth: { totalVolume: 4000, totalSets: 200, totalReps: 800 },
      previousMonth: { totalVolume: 3500, totalSets: 175, totalReps: 700 },
      changePercentage: 14.3
    }
  })
  monthlyVolume: {
    currentMonth: { totalVolume: number; totalSets: number; totalReps: number };
    previousMonth: { totalVolume: number; totalSets: number; totalReps: number };
    changePercentage: number;
  };

  @ApiProperty({
    description: 'Comparison of workout frequency metrics',
    example: {
      currentWeek: 3,
      previousWeek: 2,
      changePercentage: 50.0
    }
  })
  workoutFrequencyWeekly: {
    currentWeek: number;
    previousWeek: number;
    changePercentage: number;
  };

  @ApiProperty({
    description: 'Comparison of workout frequency metrics',
    example: {
      currentMonth: 12,
      previousMonth: 10,
      changePercentage: 20.0
    }
  })
  workoutFrequencyMonthly: {
    currentMonth: number;
    previousMonth: number;
    changePercentage: number;
  };

  @ApiProperty({
    description: 'Comparison of personal records count',
    example: {
      currentWeek: 2,
      previousWeek: 1,
      changePercentage: 100.0
    }
  })
  personalRecordsWeekly: {
    currentWeek: number;
    previousWeek: number;
    changePercentage: number;
  };

  @ApiProperty({
    description: 'Comparison of personal records count',
    example: {
      currentMonth: 5,
      previousMonth: 3,
      changePercentage: 66.7
    }
  })
  personalRecordsMonthly: {
    currentMonth: number;
    previousMonth: number;
    changePercentage: number;
  };

  @ApiProperty({
    description: 'Current workout consistency metrics',
    example: {
      currentStreak: 5,
      longestStreak: 10,
      workoutsThisWeek: 3,
      workoutsThisMonth: 12,
      averageWorkoutsPerWeek: 2.5,
      adherencePercentage: 75,
      totalWorkoutDays: 20
    }
  })
  currentConsistency: WorkoutConsistency;

  @ApiProperty({
    description: 'Array of recent personal records',
    example: [
      {
        type: 'HEAVIEST_WEIGHT',
        value: 100,
        achievedAt: '2023-01-15T10:30:00Z',
        exerciseId: 'ex1',
        sessionId: 'sess1'
      }
    ]
  })
  recentPersonalRecords: PersonalRecord[];

  constructor(
    workoutVolume: {
      currentWeek: { totalVolume: number; totalSets: number; totalReps: number };
      previousWeek: { totalVolume: number; totalSets: number; totalReps: number };
      changePercentage: number;
    },
    monthlyVolume: {
      currentMonth: { totalVolume: number; totalSets: number; totalReps: number };
      previousMonth: { totalVolume: number; totalSets: number; totalReps: number };
      changePercentage: number;
    },
    workoutFrequencyWeekly: {
      currentWeek: number;
      previousWeek: number;
      changePercentage: number;
    },
    workoutFrequencyMonthly: {
      currentMonth: number;
      previousMonth: number;
      changePercentage: number;
    },
    personalRecordsWeekly: {
      currentWeek: number;
      previousWeek: number;
      changePercentage: number;
    },
    personalRecordsMonthly: {
      currentMonth: number;
      previousMonth: number;
      changePercentage: number;
    },
    currentConsistency: WorkoutConsistency,
    recentPersonalRecords: PersonalRecord[],
  ) {
    this.workoutVolume = workoutVolume;
    this.monthlyVolume = monthlyVolume;
    this.workoutFrequencyWeekly = workoutFrequencyWeekly;
    this.workoutFrequencyMonthly = workoutFrequencyMonthly;
    this.personalRecordsWeekly = personalRecordsWeekly;
    this.personalRecordsMonthly = personalRecordsMonthly;
    this.currentConsistency = currentConsistency;
    this.recentPersonalRecords = recentPersonalRecords;
  }
}