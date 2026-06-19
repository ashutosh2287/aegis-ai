import { IsOptional, IsString, IsIn, IsInt, Min, IsDateString } from 'class-validator';

export class ComparativeQueryDto {
  @IsOptional()
  @IsIn(['day', 'week', 'month', 'year'])
  period?: string;

  @IsOptional()
  @IsIn(['previous_period', 'historical_average', 'goal_based'])
  comparisonType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  lookbackPeriods?: number; // For historical average, how many periods to look back

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