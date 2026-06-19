import { ApiProperty } from '@nestjs/swagger';

export class ForecastRecommendationDto {
  @ApiProperty({
    description: 'Type of recommendation (strength, volume, or frequency)',
    enum: ['strength', 'volume', 'frequency'],
    example: 'strength',
  })
  type: 'strength' | 'volume' | 'frequency';

  @ApiProperty({
    description: 'Priority of the recommendation',
    enum: ['low', 'medium', 'high'],
    example: 'medium',
  })
  priority: 'low' | 'medium' | 'high';

  @ApiProperty({
    description: 'Expected impact description',
    example: 'Increase 30-day strength projection by 10%',
  })
  expectedImpact: string;

  @ApiProperty({
    description: 'Supporting analytics data',
    example: { suggestedIncrease: 10 },
  })
  supportingAnalytics: Record<string, any>;

  constructor(
    type: 'strength' | 'volume' | 'frequency',
    priority: 'low' | 'medium' | 'high',
    expectedImpact: string,
    supportingAnalytics: Record<string, any>,
  ) {
    this.type = type;
    this.priority = priority;
    this.expectedImpact = expectedImpact;
    this.supportingAnalytics = supportingAnalytics;
  }
}