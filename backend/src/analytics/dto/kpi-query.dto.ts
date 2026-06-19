import { IsOptional, IsString, IsIn, IsDateString } from 'class-validator';

export class KpiQueryDto {
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
  @IsIn(['strength', 'volume', 'consistency', 'frequency', 'all'])
  category?: string;
}