import { IsOptional, IsString, IsArray, IsNumber, Min, Max, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class WorkoutRequestDto {
  @ApiPropertyOptional({
    description: 'Primary goal for the workout program',
    example: 'muscle_gain',
    enum: ['muscle_gain', 'fat_loss', 'strength', 'endurance', 'general_fitness'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['muscle_gain', 'fat_loss', 'strength', 'endurance', 'general_fitness'])
  goal?: string;

  @ApiPropertyOptional({
    description: 'Number of training days per week',
    example: 4,
    minimum: 2,
    maximum: 7,
  })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(7)
  daysPerWeek?: number;

  @ApiPropertyOptional({
    description: 'Specific muscle groups to focus on',
    example: ['chest', 'back', 'shoulders'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  focusAreas?: string[];

  @ApiPropertyOptional({
    description: 'Additional notes or preferences',
    example: 'No squats due to knee issues. Prefer dumbbell exercises.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Workout duration in minutes',
    example: 60,
    minimum: 30,
    maximum: 180,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(180)
  durationMinutes?: number;
}
