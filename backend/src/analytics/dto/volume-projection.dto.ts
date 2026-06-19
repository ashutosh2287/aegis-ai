import { ApiProperty } from '@nestjs/swagger';

export class VolumeProjectionDto {
  @ApiProperty({
    description: 'Projected weekly volume',
    example: 1000,
  })
  projectedWeeklyVolume: number;

  @ApiProperty({
    description: 'Projected monthly volume',
    example: 4000,
  })
  projectedMonthlyVolume: number;

  @ApiProperty({
    description: 'Projected quarterly volume',
    example: 12000,
  })
  projectedQuarterlyVolume: number;

  @ApiProperty({
    description: 'Estimated target achievement date (ISO string)',
    example: '2026-12-31T00:00:00Z',
  })
  estimatedTargetAchievementDate: string;

  constructor(
    projectedWeeklyVolume: number,
    projectedMonthlyVolume: number,
    projectedQuarterlyVolume: number,
    estimatedTargetAchievementDate: string,
  ) {
    this.projectedWeeklyVolume = projectedWeeklyVolume;
    this.projectedMonthlyVolume = projectedMonthlyVolume;
    this.projectedQuarterlyVolume = projectedQuarterlyVolume;
    this.estimatedTargetAchievementDate = estimatedTargetAchievementDate;
  }
}