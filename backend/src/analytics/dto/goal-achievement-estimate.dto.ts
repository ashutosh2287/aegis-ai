import { ApiProperty } from '@nestjs/swagger';

export class GoalAchievementEstimateDto {
  @ApiProperty({
    description: 'Description of the goal (e.g., \"Increase bench press to 100kg\")',
    example: 'Increase bench press to 100kg',
  })
  target: string;

  @ApiProperty({
    description: 'Estimated completion date (ISO string)',
    example: '2026-12-31T00:00:00Z',
  })
  estimatedCompletionDate: string;

  @ApiProperty({
    description: 'Confidence level of the estimate (0 to 1)',
    example: 0.85,
  })
  confidenceLevel: number;

  @ApiProperty({
    description: 'Required weekly progress to reach the goal',
    example: 2.5,
  })
  requiredWeeklyProgress: number;

  constructor(
    target: string,
    estimatedCompletionDate: string,
    confidenceLevel: number,
    requiredWeeklyProgress: number,
  ) {
    this.target = target;
    this.estimatedCompletionDate = estimatedCompletionDate;
    this.confidenceLevel = confidenceLevel;
    this.requiredWeeklyProgress = requiredWeeklyProgress;
  }
}