import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';

export class InsightsQueryDto {
  @IsOptional()
  @IsIn(['day', 'week', 'month', 'year', 'all'])
  timeframe?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  type?: string; // e.g., 'performance', 'consistency', 'strength'
}