import { IsString, IsOptional } from 'class-validator';

export class CreateWorkoutSessionDto {
  @IsString()
  workoutId!: string;

  @IsString()
  @IsOptional()
  notes?: string;
}