import { IsArray, IsInt, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class ReorderItemDto {
  @IsUUID()
  id!: string;

  @IsInt()
  orderIndex!: number;
}

export class ReorderWorkoutExercisesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items!: ReorderItemDto[];
}
