import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  MinLength,
} from "class-validator";
import {
  MovementPattern,
  DifficultyLevel,
} from "../../common/enums/database.enums";

export class UpdateExerciseDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MovementPattern)
  @IsOptional()
  movementPattern?: MovementPattern;

  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: DifficultyLevel;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  muscleGroups?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  equipmentNeeded?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
