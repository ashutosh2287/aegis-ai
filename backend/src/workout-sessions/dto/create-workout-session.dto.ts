import { IsString, IsOptional } from "class-validator";

export class CreateWorkoutSessionDto {
  @IsString()
  @IsOptional()
  notes?: string;
}
