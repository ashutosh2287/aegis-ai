import { ApiProperty } from '@nestjs/swagger';

export class StrengthProjectionDto {
  @ApiProperty({
    description: 'Predicted strength after 30 days',
    example: 150,
  })
  predicted30DayStrength: number;

  @ApiProperty({
    description: 'Predicted strength after 60 days',
    example: 165,
  })
  predicted60DayStrength: number;

  @ApiProperty({
    description: 'Predicted strength after 90 days',
    example: 180,
  })
  predicted90DayStrength: number;

  @ApiProperty({
    description: 'Estimated target achievement date (ISO string)',
    example: '2026-12-31T00:00:00Z',
  })
  estimatedTargetAchievementDate: string;

  constructor(
    predicted30DayStrength: number,
    predicted60DayStrength: number,
    predicted90DayStrength: number,
    estimatedTargetAchievementDate: string,
  ) {
    this.predicted30DayStrength = predicted30DayStrength;
    this.predicted60DayStrength = predicted60DayStrength;
    this.predicted90DayStrength = predicted90DayStrength;
    this.estimatedTargetAchievementDate = estimatedTargetAchievementDate;
  }
}