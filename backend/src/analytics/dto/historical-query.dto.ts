import { IsOptional, IsString, IsIn, IsDateString } from 'class-validator';

export class HistoricalQueryDto {
  @IsOptional()
  @IsIn(['hour', 'day', 'week', 'month'])
  granularity?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(['volume', 'weight', 'reps', 'sets', 'workouts', 'consistency'])
  metric?: string;
}