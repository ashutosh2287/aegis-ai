import {
  IsString,
  IsInt,
  IsArray,
  IsEnum,
  IsOptional,
  IsBoolean,
} from "class-validator";
import {
  MovementPattern,
  DifficultyLevel,
} from "../../common/enums/database.enums";

export class ExerciseResponseDto {
  @IsString()
  id!: string;

  @IsString()
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

  @IsBoolean()
  isCustom!: boolean;

  @IsString()
  @IsOptional()
  createdBy?: string; // UUID of the user who created it (if custom)

  @IsString()
  @IsOptional()
  parentVariationId?: string; // UUID of the parent exercise (if a variation)

  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @IsBoolean()
  isActive!: boolean;

  @IsString()
  createdAt!: string;

  @IsString()
  updatedAt!: string;

  // Relations (optional, will be populated if requested)
  @IsArray()
  @IsOptional()
  muscleGroups?: string[]; // Array of muscle group names

  @IsArray()
  @IsOptional()
  equipmentNeeded?: string[]; // Array of equipment names
}
