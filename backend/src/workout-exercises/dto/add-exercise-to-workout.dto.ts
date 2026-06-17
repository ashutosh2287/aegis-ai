import {
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class AddExerciseToWorkoutDto {
  @IsUUID()
  exerciseId!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}