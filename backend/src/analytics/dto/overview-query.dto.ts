import { IsOptional, IsString, IsIn } from 'class-validator';

export class OverviewQueryDto {
  @IsOptional()
  @IsIn(['day', 'week', 'month', 'year', 'all'])
  timeframe?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}