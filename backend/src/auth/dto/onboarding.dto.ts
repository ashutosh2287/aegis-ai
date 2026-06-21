import {
  IsArray,
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExperienceLevel, WeightUnit } from '../../common/enums/database.enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OnboardingDto {
  @ApiProperty({ description: 'Fitness goals', example: ['strength', 'endurance'] })
  @IsArray()
  @IsString({ each: true })
  goals: string[] = [];

  @ApiProperty({ description: 'Available equipment', example: ['barbell', 'dumbbells'] })
  @IsArray()
  @IsString({ each: true })
  equipment: string[] = [];

  @ApiProperty({ enum: ExperienceLevel, description: 'Experience level' })
  @IsEnum(ExperienceLevel)
  experience_level: ExperienceLevel = ExperienceLevel.NEW;

  @ApiPropertyOptional({ description: 'Target training days per week', example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  target_days_per_week?: number;

  @ApiPropertyOptional({ description: 'Body weight', example: 75 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ enum: WeightUnit, description: 'Weight unit preference' })
  @IsEnum(WeightUnit)
  weight_unit: WeightUnit = WeightUnit.METRIC;

  @ApiPropertyOptional({ description: 'How did you hear about us?', example: 'friend' })
  @IsOptional()
  @IsString()
  referral_source?: string;
}
