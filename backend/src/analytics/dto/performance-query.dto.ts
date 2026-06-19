import { IsOptional, IsString, IsIn, IsDateString } from 'class-validator';

export class PerformanceQueryDto {
  @IsOptional()
  @IsIn(['day', 'week', 'month', 'year', 'all'])
  timeframe?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(['strength', 'endurance', 'volume', 'frequency', 'all'])
  aspect?: string;
}