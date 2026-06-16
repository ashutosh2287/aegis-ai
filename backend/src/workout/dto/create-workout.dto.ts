import { IsString, IsOptional, IsArray, ValidateNested, IsInt, IsPositive, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SetDto {
  @IsInt()
  @IsPositive()
  setNumber!: number;

  @IsInt()
  @IsPositive()
  reps!: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsNumber()
  @IsOptional()
  rpe?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class WorkoutExerciseDto {
  @IsString()
  exerciseId!: string; // Reference to the exercise table

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetDto)
  sets!: SetDto[];
}

export class CreateWorkoutDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutExerciseDto)
  exercises!: WorkoutExerciseDto[];
}