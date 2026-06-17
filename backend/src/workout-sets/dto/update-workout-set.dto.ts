import { IsInt, Min, Max, IsNumber, IsOptional } from 'class-validator';

export class UpdateWorkoutSetDto {
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  reps?: number;

  @IsNumber()
  @Min(0)
  @Max(5000)
  @IsOptional()
  weight?: number;

  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  rpe?: number;

  @IsOptional()
  notes?: string;
}