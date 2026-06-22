import { IsString, IsOptional, IsUrl, MinLength, IsArray, IsEnum, IsInt, Min, Max, IsNumber } from 'class-validator';
import { ExperienceLevel, WeightUnit } from '../../common/enums/database.enums';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @IsOptional()
  @IsEnum(ExperienceLevel)
  experience_level?: ExperienceLevel;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  target_days_per_week?: number;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsEnum(WeightUnit)
  weight_unit?: WeightUnit;
}