import { ApiProperty } from '@nestjs/swagger';

export class GoalProjectionDto {
  @ApiProperty({ example: 'goal-1' })
  goalId!: string;

  @ApiProperty({ example: 'exercise-uuid' })
  exerciseId!: string;

  @ApiProperty({ example: 'Bench Press' })
  exerciseName!: string;

  @ApiProperty({ enum: ['strength', 'volume', 'frequency'] })
  goalType!: 'strength' | 'volume' | 'frequency';

  @ApiProperty({ example: 100 })
  targetValue!: number;

  @ApiProperty({ example: 85 })
  currentValue!: number;

  @ApiProperty({ example: 85 })
  progressPercentage!: number;

  @ApiProperty({ enum: ['on_track', 'at_risk', 'behind', 'achieved', 'expired'] })
  status!: 'on_track' | 'at_risk' | 'behind' | 'achieved' | 'expired';

  @ApiProperty({ example: '2026-12-31T00:00:00Z', nullable: true })
  projectedCompletionDate!: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00Z' })
  startDate!: string;

  @ApiProperty({ example: '2026-12-31T00:00:00Z', nullable: true })
  deadline!: string | null;

  @ApiProperty({ example: 180, nullable: true })
  daysRemaining!: number | null;

  @ApiProperty({ example: 2.5 })
  weeklyRate!: number;

  @ApiProperty({ example: 0.8, nullable: true })
  requiredWeeklyRate!: number | null;

  constructor(partial: Partial<GoalProjectionDto>) {
    Object.assign(this, partial);
  }
}
