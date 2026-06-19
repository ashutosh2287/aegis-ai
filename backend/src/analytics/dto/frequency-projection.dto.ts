import { ApiProperty } from '@nestjs/swagger';

export class FrequencyProjectionDto {
  @ApiProperty({
    description: 'Predicted weekly workout frequency',
    example: 4,
  })
  predictedWeeklyFrequency: number;

  @ApiProperty({
    description: 'Predicted monthly workout frequency',
    example: 16,
  })
  predictedMonthlyFrequency: number;

  @ApiProperty({
    description: 'Projected consistency trend (percentage or score)',
    example: 85,
  })
  consistencyTrendProjection: number;

  constructor(
    predictedWeeklyFrequency: number,
    predictedMonthlyFrequency: number,
    consistencyTrendProjection: number,
  ) {
    this.predictedWeeklyFrequency = predictedWeeklyFrequency;
    this.predictedMonthlyFrequency = predictedMonthlyFrequency;
    this.consistencyTrendProjection = consistencyTrendProjection;
  }
}