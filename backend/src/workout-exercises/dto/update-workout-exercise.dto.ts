import {
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateWorkoutExerciseDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  orderIndex?: number;
}