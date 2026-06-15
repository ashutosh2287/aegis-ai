import { IsString, IsOptional, IsArray, IsEnum, MinLength } from 'class-validator';
import { MovementPattern, DifficultyLevel } from '../../common/enums/database.enums';

export class CreateExerciseDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MovementPattern)
  movementPattern!: MovementPattern;

  @IsEnum(DifficultyLevel)
  difficulty!: DifficultyLevel;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  muscleGroups?: string[]; // Array of muscle group names

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  equipmentNeeded?: string[]; // Array of equipment names

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  parentVariationId?: string;
}