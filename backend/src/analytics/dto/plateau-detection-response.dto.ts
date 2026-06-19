import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlateauDetectionResponseDto {
  @ApiProperty({
    description: 'Whether a plateau was detected',
    example: true
  })
  plateauDetected: boolean;

  @ApiPropertyOptional({
    description: 'Type of plateau detected (strength, volume, or consistency)',
    example: 'strength',
    enum: ['strength', 'volume', 'consistency']
  })
  plateauType?: 'strength' | 'volume' | 'consistency';

  @ApiPropertyOptional({
    description: 'Confidence level of the plateau detection (0-100)',
    example: 85
  })
  confidence?: number;

  @ApiPropertyOptional({
    description: 'Explanation of the plateau detection',
    example: 'No meaningful 1RM improvement over the last 21 days'
  })
  explanation?: string;

  constructor(
    plateauDetected: boolean,
    plateauType?: 'strength' | 'volume' | 'consistency',
    confidence?: number,
    explanation?: string,
  ) {
    this.plateauDetected = plateauDetected;
    this.plateauType = plateauType;
    this.confidence = confidence;
    this.explanation = explanation;
  }
}