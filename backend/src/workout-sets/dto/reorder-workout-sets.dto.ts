import { IsUUID, IsInt, Min, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItemDto {
  @IsUUID()
  id!: string;

  @IsInt()
  @Min(1)
  setNumber!: number;
}

export class ReorderWorkoutSetsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items!: ReorderItemDto[];
}