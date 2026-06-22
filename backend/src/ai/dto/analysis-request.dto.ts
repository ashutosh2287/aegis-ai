import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnalysisRequestDto {
  @ApiPropertyOptional({
    description: 'Time period for analysis',
    example: 'month',
    enum: ['week', 'month', 'quarter', 'year'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['week', 'month', 'quarter', 'year'])
  period?: string;

  @ApiPropertyOptional({
    description: 'Specific area to focus analysis on',
    example: 'strength',
    enum: ['overall', 'strength', 'volume', 'consistency'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['overall', 'strength', 'volume', 'consistency'])
  focus?: string;
}
