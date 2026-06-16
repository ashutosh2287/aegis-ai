import { IsString, IsOptional, IsArray, ValidateNested, IsInt, IsPositive, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SetResponseDto {
  @IsString()
  id!: string;

  @IsString()
  workoutExerciseId!: string;

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

  @IsString()
  createdAt!: string;
}

export class WorkoutExerciseResponseDto {
  @IsString()
  id!: string;

  @IsString()
  workoutId!: string;

  @IsString()
  exerciseId!: string;

  @IsString()
  createdAt!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetResponseDto)
  sets!: SetResponseDto[];
}

export class WorkoutResponseDto {
  @IsString()
  id!: string;

  @IsString()
  userId!: string;

  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;

  @IsString()
  @IsOptional()
  deletedAt?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutExerciseResponseDto)
  exercises!: WorkoutExerciseResponseDto[];
}