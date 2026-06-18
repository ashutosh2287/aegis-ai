import { ApiProperty } from '@nestjs/swagger';
import { WorkoutConsistency } from '../interfaces/workout-consistency.interface';
import { PersonalRecord } from '../interfaces/personal-record.interface';

export class DashboardResponseDto {
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
  workoutConsistency: WorkoutConsistency;

  @ApiProperty({
    description: 'Weekly volume metrics',
    example: {
      totalVolume: 1000,
      totalSets: 50,
      totalReps: 200
    }
  })
  weeklyVolume: { totalVolume: number; totalSets: number; totalReps: number };

  @ApiProperty({
    description: 'Monthly volume metrics',
    example: {
      totalVolume: 4000,
      totalSets: 200,
      totalReps: 800
    }
  })
  monthlyVolume: { totalVolume: number; totalSets: number; totalReps: number };

  @ApiProperty({
    description: 'Array of personal records',
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
  personalRecords: PersonalRecord[];

  constructor(
    workoutConsistency: WorkoutConsistency,
    weeklyVolume: { totalVolume: number; totalSets: number; totalReps: number },
    monthlyVolume: { totalVolume: number; totalSets: number; totalReps: number },
    personalRecords: PersonalRecord[],
  ) {
    this.workoutConsistency = workoutConsistency;
    this.weeklyVolume = weeklyVolume;
    this.monthlyVolume = monthlyVolume;
    this.personalRecords = personalRecords;
  }
}