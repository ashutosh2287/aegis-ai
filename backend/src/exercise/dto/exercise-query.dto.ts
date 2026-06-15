import { IsString, IsOptional, IsInt, Min, IsArray, IsEnum } from 'class-validator';
import { MovementPattern, DifficultyLevel } from '../../common/enums/database.enums';

export class ExerciseQueryDto {
  @IsString()
  @IsOptional()
  search?: string; // Search in name, description, tags

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  muscleGroups?: string[]; // Filter by muscle group names

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  equipment?: string[]; // Filter by equipment names

  @IsArray()
  @IsEnum(MovementPattern)
  @IsOptional()
  movementPatterns?: MovementPattern[];

  @IsArray()
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulties?: DifficultyLevel[];

  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10; // Default limit

  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number = 0; // Default offset
}