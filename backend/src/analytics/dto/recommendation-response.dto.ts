import { ApiProperty } from '@nestjs/swagger';

export class RecommendationResponseDto {
  @ApiProperty({
    description: 'Category of the recommendation (e.g., progressive overload, recovery, consistency, plateau-based)',
    example: 'progressive overload'
  })
  category: string;

  @ApiProperty({
    description: 'Priority of the recommendation (low, medium, high)',
    example: 'high'
  })
  priority: 'low' | 'medium' | 'high';

  @ApiProperty({
    description: 'The recommendation text',
    example: 'Increase weight by 5% for bench press'
  })
  recommendation: string;

  @ApiProperty({
    description: 'Rationale explaining why this recommendation is made',
    example: 'Your strength trend shows consistent improvement over the last 4 weeks'
  })
  rationale: string;

  constructor(
    category: string,
    priority: 'low' | 'medium' | 'high',
    recommendation: string,
    rationale: string,
  ) {
    this.category = category;
    this.priority = priority;
    this.recommendation = recommendation;
    this.rationale = rationale;
  }
}