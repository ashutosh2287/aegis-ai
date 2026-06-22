import { IsOptional, IsString, IsNumber, Min, Max, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class NutritionRequestDto {
  @ApiPropertyOptional({
    description: 'Dietary preference',
    example: 'non_vegetarian',
    enum: ['vegetarian', 'non_vegetarian'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['vegetarian', 'non_vegetarian'])
  dietaryPreference?: string;

  @ApiPropertyOptional({
    description: 'Body weight in kg for calorie calculation',
    example: 75,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(250)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Daily activity level',
    example: 'moderate',
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['sedentary', 'light', 'moderate', 'active', 'very_active'])
  activityLevel?: string;

  @ApiPropertyOptional({
    description: 'Any food allergies or restrictions',
    example: ['lactose_intolerant', 'gluten_free'],
  })
  @IsOptional()
  @IsString()
  restrictions?: string;

  @ApiPropertyOptional({
    description: 'Number of meals per day',
    example: 4,
    minimum: 2,
    maximum: 6,
  })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(6)
  mealsPerDay?: number;
}
